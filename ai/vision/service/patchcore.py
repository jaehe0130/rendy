"""렌디 흠집 비교 모델 — PatchCore(정상 패치 메모리 + 최근접 거리) 기반.

실험 노트북 `experiments/20261104-patchcore-damage.ipynb`의 코드를 서비스용으로 옮긴 것.
- 특징: ImageNet 사전학습 WideResNet50의 layer2·layer3 (따로 학습할 가중치 없음, 첫 실행 때 torchvision이 내려받음)
- 비교: 기준 사진(출고·받은 날)의 패치를 메모리로 쓰고, 현재 사진(반납) 패치가 메모리에서 얼마나 먼지 = 이상 점수
- 순서: 사진 맞추기(ORB + 호모그래피) → 이상 지도 → 가장 큰 덩어리 → 긴 변 길이(mm) → 2cm 기준 분류(정책 파일)

주의: 합성 데이터 실험값(F1 0.73, 길이 오차 평균 약 15mm, 자동 판정 정확도 57%)이라 결과는 "예비"다.
최종 판정은 운영자가 한다. 실제 사진으로 기준값(VISION_PIX_K, VISION_MIN_AREA)을 다시 맞춰야 한다.
"""
from __future__ import annotations

import base64
import math
import os
import urllib.request
from dataclasses import dataclass
from functools import lru_cache
from typing import List, Optional, Tuple

import cv2
import numpy as np
import torch
import torch.nn.functional as F
import torchvision
from scipy.ndimage import gaussian_filter

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IMAGE_SIZE = int(os.getenv("VISION_IMAGE_SIZE", "384"))
# 사진 가로 전체가 실제로 몇 mm인지 (기기 치수를 계약에 넣기 전 임시값). 촬영 가이드 프레임과 맞춰야 함
VISIBLE_WIDTH_MM = float(os.getenv("VISION_VISIBLE_WIDTH_MM", "400"))
PIX_K = float(os.getenv("VISION_PIX_K", "4.0"))        # 이상 지도 기준값 = 평균 + K × 표준편차
MIN_AREA = int(os.getenv("VISION_MIN_AREA", "15"))     # 이보다 작은 덩어리는 잡음으로 봄 (px)
PIX_ABS = float(os.getenv("VISION_PIX_ABS", "0"))
# 이미지 전체 이상 점수 평균이 이보다 크면 "다른 물건 · 다른 장면"으로 봄 (합성 시험: 같은 물건 ≈0.22, 다른 사진 0.81~1.01)
MISMATCH_MEAN = float(os.getenv("VISION_MISMATCH_MEAN", "0.45"))       # 이상 점수 최소 기준 (변화가 없을 때 잡음이 걸리지 않게, 실제 사진으로 맞춤)


@dataclass
class RawFinding:
    bbox: List[float]       # [x, y, w, h] 0~1 비율 (현재 사진 기준)
    length_mm: float
    peak_ratio: float       # 덩어리 최고 점수 ÷ 기준값 (1보다 클수록 뚜렷)


class PatchCore:
    def __init__(self, feat_dim: int = 384):
        w = torchvision.models.Wide_ResNet50_2_Weights.IMAGENET1K_V1
        net = torchvision.models.wide_resnet50_2(weights=w).eval().to(DEVICE)
        for p in net.parameters():
            p.requires_grad_(False)
        self.net, self.feat_dim = net, feat_dim
        self.mean = torch.tensor([0.485, 0.456, 0.406], device=DEVICE).view(1, 3, 1, 1)
        self.std = torch.tensor([0.229, 0.224, 0.225], device=DEVICE).view(1, 3, 1, 1)

    @torch.no_grad()
    def features(self, imgs: List[np.ndarray]) -> torch.Tensor:
        x = torch.from_numpy(np.stack(imgs)).permute(0, 3, 1, 2).float().to(DEVICE) / 255.0
        x = (x - self.mean) / self.std
        n = self.net
        x = n.maxpool(n.relu(n.bn1(n.conv1(x))))
        f1 = n.layer2(n.layer1(x))
        f2 = n.layer3(f1)
        f1, f2 = F.avg_pool2d(f1, 3, 1, 1), F.avg_pool2d(f2, 3, 1, 1)
        f2 = F.interpolate(f2, size=f1.shape[-2:], mode="bilinear", align_corners=False)
        f = torch.cat([f1, f2], 1)
        B, C, h, w = f.shape
        f = f.permute(0, 2, 3, 1).reshape(-1, C)
        f = F.adaptive_avg_pool1d(f.unsqueeze(1), self.feat_dim).squeeze(1)
        return f.reshape(B, h, w, self.feat_dim)

    @torch.no_grad()
    def bank(self, imgs: List[np.ndarray], coreset_ratio: float = 1.0) -> torch.Tensor:
        """정상(기준) 사진 패치 메모리. 기준 사진이 1~2장이면 코어셋 없이 전부 씀."""
        feats = self.features(imgs).reshape(-1, self.feat_dim)
        n = max(1, int(len(feats) * coreset_ratio))
        if n >= len(feats):
            return feats
        proj = feats @ torch.randn(self.feat_dim, 128, device=DEVICE) / math.sqrt(128)
        idx = [int(torch.randint(len(feats), (1,)))]
        dmin = torch.cdist(proj, proj[idx]).squeeze(1)
        for _ in range(n - 1):
            i = int(torch.argmax(dmin))
            idx.append(i)
            dmin = torch.minimum(dmin, torch.cdist(proj, proj[i:i + 1]).squeeze(1))
        return feats[idx]

    @torch.no_grad()
    def anomaly_map(self, img: np.ndarray, bank: torch.Tensor) -> np.ndarray:
        f = self.features([img])
        _, h, w, D = f.shape
        d = torch.cat([torch.cdist(c, bank).min(1).values for c in f.reshape(-1, D).split(8192)])
        m = F.interpolate(d.reshape(1, 1, h, w), size=(IMAGE_SIZE, IMAGE_SIZE), mode="bilinear", align_corners=False)
        return gaussian_filter(m[0, 0].cpu().numpy(), sigma=4)


@lru_cache(maxsize=1)
def get_model() -> PatchCore:
    return PatchCore()


def load_image(url: str) -> np.ndarray:
    """http(s) 주소 · data URI · 로컬 경로를 읽어 정사각형 RGB(IMAGE_SIZE)로."""
    if url.startswith("data:"):
        data = base64.b64decode(url.split(",", 1)[1])
    elif url.startswith(("http://", "https://")):
        with urllib.request.urlopen(url, timeout=10) as r:
            data = r.read()
    else:
        with open(url, "rb") as f:
            data = f.read()
    arr = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    if arr is None:
        raise ValueError(f"이미지를 읽을 수 없음: {url[:60]}")
    arr = cv2.cvtColor(arr, cv2.COLOR_BGR2RGB)
    h, w = arr.shape[:2]
    c = min(h, w)
    arr = arr[(h - c) // 2:(h - c) // 2 + c, (w - c) // 2:(w - c) // 2 + c]
    return cv2.resize(arr, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_AREA)


def align(src: np.ndarray, dst: np.ndarray) -> Tuple[np.ndarray, bool]:
    """src(반납)를 dst(기준)에 맞춤. 실패하면 원본과 False(→ 다시 찍기 안내)."""
    orb = cv2.ORB_create(3000)
    g1, g2 = cv2.cvtColor(src, cv2.COLOR_RGB2GRAY), cv2.cvtColor(dst, cv2.COLOR_RGB2GRAY)
    k1, d1 = orb.detectAndCompute(g1, None)
    k2, d2 = orb.detectAndCompute(g2, None)
    if d1 is None or d2 is None:
        return src, False
    mt = sorted(cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2), key=lambda m: m.distance)[:400]
    if len(mt) < 10:
        return src, False
    p1 = np.float32([k1[m.queryIdx].pt for m in mt])
    p2 = np.float32([k2[m.trainIdx].pt for m in mt])
    H, _ = cv2.findHomography(p1, p2, cv2.RANSAC, 4.0)
    if H is None:
        return src, False
    return cv2.warpPerspective(src, H, (IMAGE_SIZE, IMAGE_SIZE), borderMode=cv2.BORDER_REFLECT), True


def _analyze(baseline: List[np.ndarray], current: np.ndarray, width_mm: float):
    model = get_model()
    cur, ok = align(current, baseline[0])
    amap = model.anomaly_map(cur, model.bank(baseline))
    thr = max(float(amap.mean() + PIX_K * amap.std()), PIX_ABS)
    m = (amap > thr).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    px_per_mm = IMAGE_SIZE / width_mm
    out: List[Tuple[RawFinding, np.ndarray]] = []
    for k in range(1, n):
        x, y, w, h, area = stats[k]
        if area < MIN_AREA:
            continue
        comp = (lab == k).astype(np.uint8)
        cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        (_, _), (rw, rh), _ = cv2.minAreaRect(max(cnts, key=cv2.contourArea))
        out.append((RawFinding(
            bbox=[x / IMAGE_SIZE, y / IMAGE_SIZE, w / IMAGE_SIZE, h / IMAGE_SIZE],
            length_mm=round(max(rw, rh) / px_per_mm, 1),
            peak_ratio=float(amap[comp > 0].max() / max(thr, 1e-6)),
        ), comp))
    out.sort(key=lambda f: f[0].length_mm, reverse=True)
    return out[:3], ok, cur, amap


def find_new_damage(baseline: List[np.ndarray], current: np.ndarray) -> Tuple[List[RawFinding], bool]:
    """기준 사진(같은 면) 대비 현재 사진에 새로 생긴 손상 후보. (후보 목록, 사진 맞추기 성공 여부)"""
    found, ok, _, amap = _analyze(baseline, current, VISIBLE_WIDTH_MM)
    if float(amap.mean()) > MISMATCH_MEAN:   # 다른 물건 · 다른 장면 → 판정하지 않고 다시 찍기 안내
        return [], False
    return [f for f, _ in found], ok


def demo_compare(before: np.ndarray, after: np.ndarray, width_mm: float) -> dict:
    """체험용: 전/후 사진 → 새로 생긴 부분 후보 + 표시 이미지(JPEG data URI)."""
    found, ok, cur, amap = _analyze([before], after, width_mm)
    heat = cv2.applyColorMap((np.clip(amap / max(float(amap.max()), 1e-6), 0, 1) * 255).astype(np.uint8), cv2.COLORMAP_JET)
    view = cv2.addWeighted(cv2.cvtColor(cur, cv2.COLOR_RGB2BGR), 0.85, heat, 0.15, 0)
    for f, comp in found:
        cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(view, cnts, -1, (47, 122, 255), 2)
        x, y, w, h = (np.array(f.bbox) * IMAGE_SIZE).astype(int)
        cv2.rectangle(view, (x - 3, y - 3), (x + w + 3, y + h + 3), (47, 122, 255), 2)
    okj, jpg = cv2.imencode(".jpg", view, [cv2.IMWRITE_JPEG_QUALITY, 85])
    mismatch = float(amap.mean()) > MISMATCH_MEAN
    if mismatch:
        found = []
    return {
        "mismatch": mismatch,
        "stats": {"mean": round(float(amap.mean()), 4), "std": round(float(amap.std()), 4), "max": round(float(amap.max()), 4),
                  "peaks": [round(float(amap[c > 0].max()), 4) for _, c in found]},
        "aligned": ok,
        "findings": [{"bbox": f.bbox, "lengthMm": f.length_mm, "confidence": confidence(f.peak_ratio, ok)} for f, _ in found],
        "image": "data:image/jpeg;base64," + base64.b64encode(jpg.tobytes()).decode() if okj else None,
    }


def confidence(peak_ratio: float, aligned: bool) -> float:
    """0~1. 사진 맞추기에 실패했으면 낮게(운영자 우선 확인)."""
    c = 1 - math.exp(-(max(peak_ratio, 1.0) - 1.0) * 2.5)
    return round(min(0.95, c if aligned else c * 0.4), 2)
