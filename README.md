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
npm run db:migrate
npm run db:generate
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
<<<<<<< HEAD

## Docker で開発する

Docker Compose を使うと、フロントエンド、PostgreSQL、Redis、Adminer をまとめて起動できます。

```bash
docker compose up --build
```

起動後:

- アプリ: http://localhost:3000
- Adminer: http://localhost:8080
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Adminer の接続情報:

- データベース種類: PostgreSQL
- サーバー: `postgres`
- ユーザー名: `app`
- パスワード: `app`
- データベース: `sms_hackathon`

終了:

```bash
docker compose down
```

データベースと Redis の永続データも削除して初期化する場合:

```bash
docker compose down --volumes
```

依存パッケージを追加した後は、アプリ用イメージと `node_modules` ボリュームを更新します。

```bash
docker compose build app
docker compose run --rm app npm ci
```
=======
>>>>>>> main
