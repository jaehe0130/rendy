---
title: Rendy Vision
emoji: 🔍
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

렌디(Rendy) 흠집 비교 모델 — PatchCore(WideResNet50 특징 + 기준 사진 패치 메모리).
전/후 사진에서 새로 생긴 부분 후보를 찾고 길이를 추정한다. 결과는 **예비**이고 최종 판정은 운영자가 한다.

- `GET /healthz` · `POST /v1/compare`(계약) · `POST /v1/demo/compare`(체험용)
- 소스: https://github.com/jaehe0130/rendy/tree/dev/ai/vision
