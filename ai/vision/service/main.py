"""Rendy 비전 서비스. VISION_MOCK=1 이면 모델 없이 고정 응답(데모 시나리오와 동일)."""
import json
import os
from pathlib import Path
from typing import List, Literal, Optional

from fastapi import FastAPI
from pydantic import BaseModel

Side = Literal["FRONT", "LEFT", "RIGHT", "BACK", "TOP", "OPERATING"]


def _load_policy() -> dict:
    here = Path(__file__).resolve()
    for parent in here.parents:
        p = parent / "packages" / "shared" / "policy" / "damage-policy.json"
        if p.exists():
            return json.loads(p.read_text(encoding="utf-8"))
    return {"wearThresholdMm": 20, "reviewMarginMm": 15}


POLICY = _load_policy()
MOCK = os.getenv("VISION_MOCK", "1") == "1"
MODEL_VERSION = "mock-0" if MOCK else os.getenv("MODEL_VERSION", "dev")


class Photo(BaseModel):
    side: Side
    url: str


class Finding(BaseModel):
    side: Side
    bbox: List[float]
    lengthMm: float
    isNew: bool = True
    suggestedClass: Literal["NONE", "WEAR", "FAULT"] = "WEAR"
    confidence: float = 0.0
    needsReview: bool = False


class DetectRequest(BaseModel):
    deviceCode: Optional[str] = None
    photos: List[Photo]


class CompareRequest(BaseModel):
    deviceCode: Optional[str] = None
    baseline: List[Photo]
    current: List[Photo]
    knownFindings: List[Finding] = []


class Result(BaseModel):
    findings: List[Finding]
    retakeHints: List[dict] = []
    conditionScoreDelta: int = 0
    modelVersion: str = MODEL_VERSION


def classify(length_mm: float) -> tuple[str, bool]:
    thr, margin = POLICY["wearThresholdMm"], POLICY["reviewMarginMm"]
    cls = "WEAR" if length_mm <= thr else "FAULT"
    return cls, abs(length_mm - thr) <= margin


app = FastAPI(title="Rendy Vision", version="0.1.0")


@app.get("/healthz")
def health():
    return {"ok": True, "mock": MOCK, "modelVersion": MODEL_VERSION}


@app.post("/v1/detect", response_model=Result)
def detect(req: DetectRequest) -> Result:
    if MOCK:
        # 8-1 예시: 옆면 아래 1.2cm, 윗면 모서리 0.6cm (기존 흠)
        out = []
        for side, length, bbox in [("LEFT", 12, [0.3, 0.8, 0.12, 0.03]), ("TOP", 6, [0.85, 0.1, 0.05, 0.05])]:
            if any(p.side == side for p in req.photos):
                cls, review = classify(length)
                out.append(Finding(side=side, bbox=bbox, lengthMm=length, isNew=False,
                                   suggestedClass=cls, confidence=0.9, needsReview=review))
        return Result(findings=out)
    raise NotImplementedError("모델 연결 전: VISION_MOCK=1 로 실행")


@app.post("/v1/compare", response_model=Result)
def compare(req: CompareRequest) -> Result:
    if MOCK:
        # 데모: B-0107 은 과실 파손 4.2cm(윗면), 그 외는 옆면 새 긁힘 1.6cm
        if req.deviceCode == "B-0107":
            length, side, bbox, conf = 42, "TOP", [0.7, 0.05, 0.2, 0.06], 0.71
        else:
            length, side, bbox, conf = 16, "LEFT", [0.45, 0.6, 0.1, 0.02], 0.83
        cls, review = classify(length)
        return Result(
            findings=[Finding(side=side, bbox=bbox, lengthMm=length, isNew=True,
                              suggestedClass=cls, confidence=conf, needsReview=review)],
            conditionScoreDelta=-4 if cls == "WEAR" else -15,
        )
    # 실제 모델 (VISION_MOCK=0): 같은 면끼리 기준 사진 대비 새 손상 후보. 결과는 예비 — 최종은 운영자
    from . import patchcore as pc  # torch 등 무거운 의존성은 이때만 불러옴 (requirements-model.txt)

    findings: List[Finding] = []
    hints: List[dict] = []
    for cur in req.current:
        base = [p for p in req.baseline if p.side == cur.side]
        if not base:
            hints.append({"side": cur.side, "reason": "NO_BASELINE"})
            continue
        raws, aligned = pc.find_new_damage([pc.load_image(p.url) for p in base], pc.load_image(cur.url))
        if not aligned:
            hints.append({"side": cur.side, "reason": "ALIGN_FAILED"})
        for r in raws:
            cls, review = classify(r.length_mm)
            conf = pc.confidence(r.peak_ratio, aligned)
            findings.append(Finding(side=cur.side, bbox=r.bbox, lengthMm=r.length_mm, isNew=True,
                                    suggestedClass=cls, confidence=conf, needsReview=review or conf < 0.5))
    worst = max((f.lengthMm for f in findings), default=0.0)
    delta = 0 if not findings else (-4 if worst <= POLICY["wearThresholdMm"] else -15)
    return Result(findings=findings, retakeHints=hints, conditionScoreDelta=delta)
