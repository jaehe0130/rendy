# 데이터 (git 제외)

학습·평가 이미지는 **공유 드라이브**에 두고 여기로 내려받아 쓴다. 이 README 외에는 커밋되지 않는다 (`.gitignore`).

- 드라이브 폴더: `rendy-vision-data` — 링크: _(만든 뒤 여기에 붙여 넣기, 공유는 "링크가 있는 사용자 · 뷰어")_

## 폴더 구조

```
rendy-vision-data/
├─ normal/<품목>/      흠집 없는 사진 (출고 기준). 같은 거리 · 각도 · 밝기로 면마다 10~30장
│    예: normal/dehumidifier-10/front_001.webp
├─ damaged/<품목>/     시험용 흠집 사진 + labels.csv (파일명, 면, 실제 길이 mm, 종류)
│    마스킹테이프 · 네임펜으로 흉내 낸 흠집도 OK — 자로 잰 길이를 꼭 적기
└─ results/           발표용 결과 이미지 (이상 지도 · 흠집 표시)
```

합성 데이터는 노트북(`experiments/20261104-patchcore-damage.ipynb`)이 실행할 때마다 다시 만들어서 올리지 않는다.
PatchCore는 따로 학습한 가중치가 없어서 `models/`에도 올릴 파일이 없다.

## 올리기 전에

1. **webp로 바꾸고 한 장 300KB 이하로** — 원본 그대로면 용량이 금방 커진다
   ```bash
   pip install pillow
   python ai/vision/tools/to_webp.py <원본 폴더> <저장 폴더>
   ```
2. **올리면 안 되는 것**: 중고 거래 사이트 등에서 가져온 남의 사진(저작권), 얼굴 · 집 주소 · 송장이 보이는 사진, 설문 원본 응답
