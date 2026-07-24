## Requirements

- Node.js 24
- npm 11

node --version
npm --version

## Set up

### location
```
sms_hackathon/
```

```bash
git pull
npm ci
cp .env.example .env
npm run dev
```
package-lock.jsonがない場合は、最初の一度だけnpm installを実行

## Branch rules
- mainブランチにダイレクトにPushしない
- feature/... brを作る
- develop br にpushする

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