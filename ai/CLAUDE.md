# ai/ — AI 담당 영역

두 가지를 담당한다.

1. **vision/** — 흠집 비교 서비스 (Python, FastAPI). 백엔드가 HTTP로 호출.
   - 계약: `vision/contract/openapi.yaml` — 바꾸면 백엔드 담당에게 공지
   - `VISION_MOCK=1`이면 모델 없이 `damage-policy.json` 기준의 고정 응답 → 백엔드·프론트가 기다리지 않게
   - 가중치·데이터는 git에 올리지 않는다 (`models/`, `data/`는 .gitignore). 공유는 드라이브/Release.
   - 실험 결과는 `vision/eval/results/*.json`에 저장하고, 발표용 요약은 `docs/ai/experiments.md`에 반영
2. **llm/prompts/** — LLM 기능의 프롬프트(상담, 가이드 글, 리뷰 요약, 상품 초안, 매입 견적)
   - 호출 코드는 백엔드(`apps/api/src/modules/ai-gateway`)가, **프롬프트 문구는 AI 담당**이 관리
   - 출력은 항상 JSON 스키마를 명시해서 백엔드가 파싱할 수 있게

## 원칙
- AI 결과는 "예비". 필드명·문구에 `preliminary`/`예비`를 유지하고, 최종은 운영자.
- 정책 숫자(2cm, reviewMargin)는 `packages/shared/policy/damage-policy.json`에서 읽는다.
- 이 폴더 밖 파일은 수정하지 않는다.
