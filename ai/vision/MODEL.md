# 흠집 비교 모델 — PatchCore 기반

반납 사진에서 **출고(받은 날) 때 없던 흠집 · 찍힘 후보**를 찾고 길이를 mm로 재는 모델. 결과는 **예비**이고 최종 판정은 운영자가 한다.

## 왜 PatchCore인가
- **흠집 사진 없이** 정상 사진만으로 쓸 수 있다 (렌탈 초기엔 파손 라벨 데이터가 없음)
- ImageNet 사전학습 WideResNet50 특징을 그대로 써서 **따로 학습할 가중치가 없다** (`models/`에 올릴 파일 없음)
- 기기마다 출고 사진이 있으니 "이 기기의 출고 사진" 자체를 정상 메모리로 쓰면 된다

## 처리 순서 (`service/patchcore.py`)
1. 사진 읽기 → 정사각형 384px
2. 반납 사진을 기준 사진에 맞춤 (ORB 특징점 + 호모그래피) — 실패하면 `retakeHints: ALIGN_FAILED`
3. 기준 사진 패치를 메모리로, 반납 사진 패치마다 가장 가까운 정상 패치와의 거리 = 이상 지도
4. 기준값(평균 + K×표준편차)을 넘는 덩어리 → 긴 변 길이(mm)
5. `damage-policy.json`의 2cm 기준으로 `WEAR` / `FAULT`, 기준 ± `reviewMarginMm`이거나 신뢰도 0.5 미만이면 `needsReview`

## 실행
```bash
# 목(mock) — 기본값, 모델 없이 고정 응답
pip install -r requirements.txt
VISION_MOCK=1 uvicorn service.main:app --port 8001

# 실제 모델 — GPU 권장 (CPU면 사진 1장에 수 초)
pip install -r requirements-model.txt
VISION_MOCK=0 uvicorn service.main:app --port 8001
```

| 환경 변수 | 기본값 | 뜻 |
|---|---|---|
| `VISION_IMAGE_SIZE` | 384 | 모델 입력 크기. 크면 가는 흠집에 강하지만 느림 |
| `VISION_VISIBLE_WIDTH_MM` | 400 | 사진 가로 전체의 실제 폭(mm). 촬영 가이드 프레임과 맞춰야 길이가 맞음 |
| `VISION_PIX_K` | 4.0 | 이상 지도 기준값 = 평균 + K × 표준편차 |
| `VISION_MIN_AREA` | 15 | 이보다 작은 덩어리는 잡음으로 무시 (px) |

## 성능 (합성 데이터, `eval/results/2026-11-synthetic.json`)
| 지표 | 값 |
|---|---|
| 이미지 AUROC (손상 사진 구분) | 0.98 |
| 픽셀 AUROC (흠집 위치) | 0.99 |
| 흠집 찾기 F1 | 0.73 |
| 길이 오차 평균 | 약 15mm |
| 2cm 기준 자동 판정 정확도 | 57% |

실제 사진 3장 시험: 뚜렷한 흠집은 찾지만 옅은 긁힘은 놓치고, 테두리 · 반사광을 흠집으로 잡음 → **같은 기기의 출고 사진과 비교**해야 함.
그래서 서비스에서는 **AI가 후보 표시 · 길이까지만, 판정은 운영자**가 한다.

## 실험 노트북
`experiments/20261104-patchcore-damage.ipynb` — 코랩 T4에서 `런타임 > 모두 실행`.
합성 데이터 생성 → PatchCore 학습 → 측정(AUROC · F1 · 길이 오차 · 판정 정확도) → 출고/반납 비교 데모 → 내 사진으로 다시 측정(7번).

## 아직 안 된 것 · 다음 할 일
- **실행 검증 전**: `service/patchcore.py`는 노트북 코드를 옮긴 것이고 서버로는 아직 돌려 보지 않았다 (코랩/GPU 환경에서 확인 필요)
- 기기 실제 치수를 계약(`contract/openapi.yaml`)에 넣으면 `VISION_VISIBLE_WIDTH_MM` 대신 정확한 mm 환산 가능 → 백엔드와 협의
- 실제 가전 사진(같은 거리 · 각도 30장 이상)으로 `VISION_PIX_K` · `VISION_MIN_AREA` 다시 맞추기
- `/v1/detect`(출고 사진의 기존 흠집)는 아직 목만 있음
