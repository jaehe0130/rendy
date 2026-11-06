# apps/web — 프론트 담당 영역 (Next.js App Router + Tailwind)

## 구조
```
src/
├─ app/                 라우트 (얇게: features 컴포넌트를 불러오기만)
│  ├─ (customer)/...    고객 화면 — 각 폴더의 SCREEN.md에 Figma 링크
│  └─ admin/...         운영자 화면 (/admin, AdminHeader)
├─ features/<도메인>/   화면 로직·컴포넌트 (도메인 폴더 = 충돌 단위, 담당자 1명)
├─ components/ui/       공용 UI (Button, Input, ProductCard, AiBadge…) — 프론트 리드만 수정
└─ lib/api/             API 클라이언트 + mocks/ (NEXT_PUBLIC_USE_MOCK=1)
```

## 규칙
- 화면 구현은 `/implement-screen <번호>`. Figma 링크는 라우트 폴더의 `SCREEN.md`.
- 색·폰트·간격은 `design/tokens/tokens.json`을 Tailwind theme로 연결해서만 사용.
- 타입은 `@rendy/shared`. 정책 숫자는 `damagePolicy` (2cm, 48시간 등 하드코딩 금지).
- 주문 화면은 `/checkout` 하나(2-4·3-3·7-5 공통), 꾸러미·쿠폰은 상태로 처리.
- AI 결과 UI: "AI 예비 판정" 배지 + `needsReview`면 "운영자 확인 후 확정" 표시. "AI가 판정" 같은 문구 금지.
- 공용 파일(`app/layout.tsx`, `components/ui/*`)은 프론트 리드만 수정.
- `apps/web/` 밖 파일은 수정하지 않는다.
