"""ai/vision 흠집 비교 서비스를 Modal(서버리스 CPU)에 올린다. Hugging Face의 Docker Space가 유료가 되어 대신 씀.

배포:  modal token new   (처음 한 번, 브라우저 로그인)
       modal deploy ai/vision/deploy/modal_app.py
주소:  https://<워크스페이스>--rendy-vision-web.modal.run  (/healthz, /v1/compare, /v1/demo/compare)

심사 시간처럼 첫 응답이 느리면 안 될 때: KEEP_WARM=1 modal deploy ... (컨테이너 1개를 계속 켜 둠, 크레딧 사용)
"""
import os
from pathlib import Path

import modal

# 로컬 경로는 배포하는 컴퓨터에서만 계산 (Modal 컨테이너 안에서는 이 파일이 /root에 있어 경로가 다름)
if modal.is_local():
    VISION = Path(__file__).resolve().parents[1]
    ROOT = VISION.parents[1]
else:
    VISION = ROOT = Path("/root")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("torch", "torchvision", index_url="https://download.pytorch.org/whl/cpu")
    .pip_install("fastapi[standard]==0.115.*", "pydantic==2.*", "opencv-python-headless>=4.9", "numpy>=1.26", "scipy>=1.11")
    .env({"VISION_MOCK": "0", "MODEL_VERSION": "patchcore-wrn50-v1", "TORCH_HOME": "/root/torch", "PYTHONPATH": "/root/vision",
          # 이상 점수 최소 기준: 합성 시험에서 변화 없음 0.47 이하, 흠집 · 테이프 0.67~0.87 → 0.55 (실제 사진으로 다시 맞출 것)
          "VISION_PIX_ABS": "0.55"})
    # 사전학습 가중치를 이미지에 넣어 둠 (요청 때 내려받지 않게)
    .run_commands("python -c \"import torchvision; torchvision.models.wide_resnet50_2(weights='IMAGENET1K_V1')\"")
    .add_local_dir(str(VISION / "service"), "/root/vision/service", ignore=["__pycache__"])
    # main.py가 위로 올라가며 찾는 정책 파일 위치(/root/packages/...)에 둠
    .add_local_file(str(ROOT / "packages" / "shared" / "policy" / "damage-policy.json"), "/root/packages/shared/policy/damage-policy.json")
)

app = modal.App("rendy-vision")


@app.function(image=image, cpu=2.0, memory=4096, timeout=120, scaledown_window=120,
              min_containers=int(os.getenv("KEEP_WARM", "0")))
@modal.asgi_app()
def web():
    from service.main import app as fastapi_app
    return fastapi_app
