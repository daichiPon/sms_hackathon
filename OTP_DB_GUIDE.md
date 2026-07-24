# DBでOTPの発行状態を確認する方法

OTPの平文はDBへ保存されません。HMAC-SHA-256値はSQLiteの`SmsCode`テーブルに保存されます。
以下の手順は開発・デバッグ用途に限定してください。

## Docker環境で最新のOTP発行状態を確認する

プロジェクトのルートディレクトリで、次のコマンドを実行します。

```bash
docker compose exec -T backend node -e "
const Database = require(
  '/app/node_modules/@prisma/adapter-better-sqlite3/node_modules/better-sqlite3'
);
const db = new Database('/data/dev.db', { readonly: true });
const result = db.prepare(\`
  SELECT
    s.codeHash,
    s.expiresAt,
    s.usedAt,
    s.createdAt,
    u.loginId,
    u.phoneNumber
  FROM SmsCode AS s
  JOIN User AS u ON u.id = s.userId
  ORDER BY s.createdAt DESC
  LIMIT 1
\`).get();
console.log(result ?? 'OTPはまだ発行されていません');
"
```

表示例:

```text
{
  codeHash: '<64-character hex digest>',
  expiresAt: '2026-07-24T08:47:10.482+00:00',
  usedAt: null,
  createdAt: '2026-07-24T08:42:10.485+00:00',
  loginId: 'demo',
  phoneNumber: '09001111101'
}
```

各項目の意味:

- `codeHash`: OTPのHMAC-SHA-256値です。元の6桁OTPへ復元はできません。
- `expiresAt`: OTPの有効期限です。DBではUTCで表示されます。
- `usedAt`: `null`なら未使用、日時が入っていれば使用済みです。
- `createdAt`: OTPを発行した日時です。
- `loginId`: OTPを発行したユーザーです。
- `phoneNumber`: SMSの送信先番号です。

## 未使用かつ有効なOTPだけ確認する

次のコマンドでは、有効期限内かつ未使用の最新OTPだけを表示します。

```bash
docker compose exec -T backend node -e "
const Database = require(
  '/app/node_modules/@prisma/adapter-better-sqlite3/node_modules/better-sqlite3'
);
const db = new Database('/data/dev.db', { readonly: true });
const result = db.prepare(\`
  SELECT
    s.codeHash,
    s.expiresAt,
    u.loginId,
    u.phoneNumber
  FROM SmsCode AS s
  JOIN User AS u ON u.id = s.userId
  WHERE s.usedAt IS NULL
    AND datetime(s.expiresAt) > datetime('now')
  ORDER BY s.createdAt DESC
  LIMIT 1
\`).get();
console.log(result ?? '有効なOTPはありません');
"
```

## SQLiteコマンドが使える場合

ホスト側に`sqlite3`がインストールされ、DBファイルへアクセスできる場合は、
次のSQLでも確認できます。

```sql
SELECT
  s.codeHash,
  s.expiresAt,
  s.usedAt,
  s.createdAt,
  u.loginId,
  u.phoneNumber
FROM SmsCode AS s
JOIN User AS u ON u.id = s.userId
ORDER BY s.createdAt DESC
LIMIT 1;
```

Docker Compose環境のDBファイルはコンテナ内の`/data/dev.db`です。

## 注意事項

- OTPを確認するのは開発環境だけにしてください。
- OTPをチャット、Issue、画面キャプチャ、ログへ残さないでください。
- `OTP_HMAC_SECRET`は十分に長いランダム値を設定し、DBとは別に管理してください。
- 確認コマンドでは、誤更新を防ぐためDBを読み取り専用で開いています。
- OTPは発行から5分で期限切れになり、認証成功後は再利用できません。
