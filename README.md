## Requirements

- Node.js 24
- npm 11

node --version
npm --version

## Set up

### Frontend location
```
frontend/
```

```bash
git pull
cd frontend
npm ci
cp .env.example .env
npm start
```
package-lock.jsonがない場合は、最初の一度だけnpm installを実行

### Backend location
```
backend/
```

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

Backend API:
- POST /auth/login
- POST /auth/verify-sms

## Branch rules
- mainブランチにダイレクトにPushしない
- feature/... brを作る

## Test account
- id: demo
- password: password
- sms code: 1234

## Format
commit 前に
```bash
npm run format
npm run lint
```

## Adding dependencies
新しいpackageを追加する場合
```
npm install <package-name>
```
開発用パッケージ
```
npm install --save-dev <package-name>
```
