-- Existing OTPs cannot be converted to HMACs without the server-side secret.
-- They are short-lived, so invalidate them before changing the storage column.
DELETE FROM "SmsCode";

ALTER TABLE "SmsCode" RENAME COLUMN "code" TO "codeHash";
