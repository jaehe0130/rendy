"""사진을 webp로 바꾸고 한 장 300KB 이하로 줄인다 (올리기 전 용량 규칙).

사용: python ai/vision/tools/to_webp.py <원본 폴더> <저장 폴더> [--max-kb 300] [--max-side 1600]
- 하위 폴더 구조는 그대로 유지
- 품질을 90 → 50까지 낮추고, 그래도 크면 긴 변을 줄여서 다시 시도
- 사진의 촬영 정보(EXIF: 위치 등)는 저장하지 않음
"""
import argparse
import io
from pathlib import Path

from PIL import Image, ImageOps

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".heic"}


def shrink(img: Image.Image, max_kb: int, max_side: int) -> bytes:
    img = ImageOps.exif_transpose(img).convert("RGB")
    side = max_side
    while True:
        im = img.copy()
        im.thumbnail((side, side))
        for q in range(90, 45, -5):
            buf = io.BytesIO()
            im.save(buf, "WEBP", quality=q, method=6)
            if buf.tell() <= max_kb * 1024:
                return buf.getvalue()
        side = int(side * 0.8)
        if side < 320:
            return buf.getvalue()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--max-kb", type=int, default=300)
    ap.add_argument("--max-side", type=int, default=1600)
    a = ap.parse_args()
    src, dst = Path(a.src), Path(a.dst)
    n = 0
    for p in sorted(src.rglob("*")):
        if p.suffix.lower() not in EXTS:
            continue
        out = (dst / p.relative_to(src)).with_suffix(".webp")
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            data = shrink(Image.open(p), a.max_kb, a.max_side)
        except Exception as e:  # 읽을 수 없는 파일은 건너뜀
            print(f"건너뜀 {p}: {e}")
            continue
        out.write_bytes(data)
        n += 1
        print(f"{p.name} → {out.relative_to(dst)} ({len(data) // 1024}KB)")
    print(f"완료 {n}장")


if __name__ == "__main__":
    main()
