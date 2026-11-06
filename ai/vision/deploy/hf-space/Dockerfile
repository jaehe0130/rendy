FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 TORCH_HOME=/app/torch VISION_MOCK=0 MODEL_VERSION=patchcore-wrn50-v1
WORKDIR /app
# CPU용 torch (용량 작음)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt requirements-model.txt ./
RUN pip install --no-cache-dir -r requirements-model.txt
# 사전학습 가중치를 미리 받아 둠 (첫 요청이 느려지지 않게)
RUN python -c "import torchvision; torchvision.models.wide_resnet50_2(weights='IMAGENET1K_V1')"
COPY . .
RUN chmod -R 777 /app
EXPOSE 7860
CMD ["uvicorn", "service.main:app", "--host", "0.0.0.0", "--port", "7860"]
