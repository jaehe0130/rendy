# 렌디 (Rendy) — 성북구 1인 가구 생활가전 렌탈 구독

필요한 가전만, 필요한 만큼. 2개월부터 1개월 단위로 빌리고, 떠날 때는 팔고(바이백), 반납은 AI가 사진으로 흠집을 찾아 운영자 판정을 돕습니다.

## 저장소 구조

```
rendy/
├─ apps/web          프론트엔드 (Next.js) — 고객 화면 + /admin 운영자 화면
├─ apps/api          백엔드 (NestJS)
├─ ai/               AI — 흠집 비교(비전 서비스) + LLM 프롬프트
├─ database/         DB 스키마(Prisma) · 시드 데이터
├─ design/           디자인 토큰 · Figma 링크 · 에셋
├─ packages/shared   공용 타입 · 정책값(파손 판정 기준 등)
└─ docs/             화면 맵 · API 계약 · 실험 결과 · 발표 메시지
```

- 처음 세팅: [docs/setup.md](docs/setup.md)
- 화면 ↔ 라우트 ↔ API: [docs/screens.md](docs/screens.md)
- 협업 규칙(브랜치·커밋·충돌 방지): [docs/conventions.md](docs/conventions.md)
- 와이어프레임에서 발견한 확인 필요 사항: [docs/open-issues.md](docs/open-issues.md)
