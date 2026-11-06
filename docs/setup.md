# 처음 세팅 (리드 1명이 한 번만)

Claude Code에서 "docs/setup.md대로 초기 세팅해줘"라고 하면 됩니다. 앱 폴더에 이미 CLAUDE.md·SCREEN.md가 있어서
생성기는 **임시 폴더에 만든 뒤 옮겨야** 합니다 (create-next-app, nest new는 비어 있지 않은 폴더를 거부함).

## 1. 프론트 (apps/web)
```bash
pnpm create next-app@latest /tmp/web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --skip-install
rsync -a --ignore-existing /tmp/web/ apps/web/
# apps/web/package.json 의 name 을 "@rendy/web" 으로, dependencies 에 "@rendy/shared": "workspace:*" 추가
```

## 2. 백엔드 (apps/api)
```bash
npx -y @nestjs/cli new /tmp/api --package-manager pnpm --skip-install --skip-git
rsync -a --ignore-existing /tmp/api/ apps/api/
# apps/api/package.json: name "@rendy/api", 의존성 "@rendy/shared": "workspace:*", prisma, @prisma/client 추가
# apps/api/package.json 에 아래 추가 (스키마는 database/ 에 있음)
#   "prisma": { "schema": "../../database/prisma/schema.prisma", "seed": "ts-node ../../database/seed/seed.ts" }
```

## 3. 설치 · DB
```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm db:migrate --name init
pnpm db:seed
```

## 4. AI 비전 서비스 (mock 모드)
```bash
cd ai/vision && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
VISION_MOCK=1 uvicorn service.main:app --reload --port 8001
```

## 5. GitHub
- `.github/CODEOWNERS`의 `@..._ID`를 실제 아이디로 교체
- 브랜치 보호: `main`, `dev`에 PR 필수 · 리뷰 1명
