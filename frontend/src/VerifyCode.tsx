/* ------------------------------------------------------------------ *
 *  SMS コード確認画面
 *  送信したコードと入力されたコードの一致をサーバーで検証する。
 *  依存ライブラリなし。CSS は同ファイル内に同梱。
 * ------------------------------------------------------------------ */

import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface VerifyCodeProps {
  /** 送信先の表示用ヒント（例: 090****1101） */
  destination?: string;
  /** コードの桁数 */
  length?: number;
  /** コード検証。失敗時は Error を throw する */
  onVerify: (code: string) => Promise<void>;
  /** コード再送信。未指定なら再送ボタンを出さない */
  onResend?: () => Promise<void>;
  /** ログイン画面へ戻る */
  onBack?: () => void;
  /** サーバーが返した有効期限（ISO 文字列） */
  expiresAt?: string;
}

/* --- helpers ------------------------------------------------------ */

const onlyDigits = (s: string) => s.replace(/\D/g, '');

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** 残り時間を 1 秒ごとに更新する */
function useCountdown(expiresAt?: string): number | null {
  const target = useMemo(
    () => (expiresAt ? new Date(expiresAt).getTime() : null),
    [expiresAt]
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (target === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (target === null || Number.isNaN(target)) return null;
  return Math.max(0, target - now);
}

/* --- component ---------------------------------------------------- */

export default function VerifyCode({
  destination,
  length = 4,
  onVerify,
  onResend,
  onBack,
  expiresAt,
}: VerifyCodeProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join('');
  const filled = code.length === length;
  const remaining = useCountdown(expiresAt);
  const expired = remaining !== null && remaining === 0;

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const focusAt = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), length - 1);
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  const writeDigits = (next: string[]) => {
    setDigits(next);
    if (error) setError('');
    if (notice) setNotice('');
  };

  const handleChange = (index: number, raw: string) => {
    const value = onlyDigits(raw);
    if (!value) {
      const next = [...digits];
      next[index] = '';
      writeDigits(next);
      return;
    }

    const next = [...digits];
    for (let i = 0; i < value.length && index + i < length; i += 1) {
      next[index + i] = value[i];
    }
    writeDigits(next);
    focusAt(index + value.length);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      writeDigits(next);
      focusAt(index - 1);
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(index - 1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = onlyDigits(e.clipboardData.getData('text'));
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    for (let i = 0; i < pasted.length && index + i < length; i += 1) {
      next[index + i] = pasted[i];
    }
    writeDigits(next);
    focusAt(index + pasted.length);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!filled || loading) return;

    setError('');
    setNotice('');
    setLoading(true);
    try {
      await onVerify(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証に失敗しました');
      setDigits(Array(length).fill(''));
      focusAt(0);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!onResend || resending) return;
    setError('');
    setNotice('');
    setResending(true);
    try {
      await onResend();
      setDigits(Array(length).fill(''));
      setNotice('コードを再送信しました');
      focusAt(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '再送信に失敗しました');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="vc-field">
      <style>{CSS}</style>

      <form className="vc-stub" onSubmit={handleSubmit} noValidate>
        <div className="vc-airmail vc-airmail--top" aria-hidden="true" />

        <header className="vc-head">
          <span className="vc-eyebrow">SMS Verification</span>
          {remaining !== null && (
            <span className={`vc-timer${expired ? ' vc-timer--out' : ''}`}>
              {expired ? 'EXPIRED' : formatRemaining(remaining)}
            </span>
          )}
        </header>

        <div className="vc-body">
          <h1 className="vc-title">確認コードを入力</h1>
          <p className="vc-lead">
            {destination
              ? `${destination} 宛に送信した ${length} 桁のコードを入力してください。`
              : `SMS で送信した ${length} 桁のコードを入力してください。`}
          </p>

          <div className="vc-inputs" role="group" aria-label={`${length}桁の確認コード`}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => {
                  inputsRef.current[i] = el;
                }}
                className={`vc-cell${error ? ' vc-cell--error' : ''}`}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={e => handlePaste(i, e)}
                onFocus={e => e.target.select()}
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={length}
                aria-label={`コード ${i + 1} 桁目`}
                aria-invalid={Boolean(error)}
                disabled={loading}
              />
            ))}
          </div>

          <p className="vc-status" role="status" aria-live="polite">
            {error ? (
              <span className="vc-status--error">{error}</span>
            ) : notice ? (
              <span className="vc-status--ok">{notice}</span>
            ) : (
              <span className="vc-status--muted">
                {expired ? 'コードの有効期限が切れました。再送信してください。' : ' '}
              </span>
            )}
          </p>
        </div>

        <div className="vc-perf" aria-hidden="true">
          <span className="vc-notch vc-notch--l" />
          <span className="vc-notch vc-notch--r" />
        </div>

        <footer className="vc-actions">
          <button type="submit" className="vc-cta" disabled={!filled || loading}>
            {loading ? '確認中...' : '認証する'}
          </button>

          {onResend && (
            <button
              type="button"
              className="vc-link"
              onClick={handleResend}
              disabled={resending || loading}
            >
              {resending ? '再送信中...' : 'コードを再送信する'}
            </button>
          )}

          {onBack && (
            <button type="button" className="vc-link" onClick={onBack} disabled={loading}>
              ログイン画面に戻る
            </button>
          )}
        </footer>

        <div className="vc-airmail vc-airmail--bottom" aria-hidden="true" />
      </form>
    </div>
  );
}

/* --- styles ------------------------------------------------------- */

const CSS = `
.vc-field {
  --field: #D9611A;
  --field-lit: #F2913D;
  --field-deep: #A2410A;
  --paper: #FBF7EF;
  --ink: #2E1708;
  --muted: #7A6553;
  --stamp: #C62A1B;
  --rule: #E2D7C4;

  --f-label: 'Archivo Narrow', 'Noto Sans JP', sans-serif;
  --f-data: 'IBM Plex Mono', ui-monospace, monospace;
  --f-body: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;

  min-height: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  box-sizing: border-box;
  background:
    radial-gradient(120% 90% at 50% 0%, var(--field-lit) 0%, var(--field) 58%, var(--field-deep) 100%);
  position: relative;
  overflow: hidden;
}
.vc-field::before {
  content: '';
  position: absolute;
  inset: -20%;
  background-image: radial-gradient(rgba(255,255,255,.22) 1px, transparent 1.4px);
  background-size: 14px 14px;
  opacity: .18;
  pointer-events: none;
}
.vc-field * { box-sizing: border-box; }

/* --- stub --- */
.vc-stub {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 430px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--f-body);
  border-radius: 3px;
  box-shadow:
    0 1px 0 rgba(255,255,255,.5) inset,
    0 26px 60px -18px rgba(74, 28, 4, .55),
    0 4px 12px rgba(74, 28, 4, .3);
  animation: vc-settle 520ms cubic-bezier(.16,.9,.3,1) both;
}
@keyframes vc-settle {
  from { opacity: 0; transform: translateY(22px) scale(.985); }
  to   { opacity: 1; transform: none; }
}

.vc-airmail { height: 9px; }
.vc-airmail--top { border-radius: 3px 3px 0 0; }
.vc-airmail--bottom { border-radius: 0 0 3px 3px; }
.vc-airmail {
  background: repeating-linear-gradient(
    -45deg,
    var(--stamp) 0 9px,
    var(--paper) 9px 18px,
    var(--field) 18px 27px,
    var(--paper) 27px 36px
  );
}

/* --- header --- */
.vc-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 16px 26px 0;
}
.vc-eyebrow {
  font-family: var(--f-label);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--muted);
}
.vc-timer {
  font-family: var(--f-data);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  letter-spacing: .08em;
  color: var(--muted);
}
.vc-timer--out { color: var(--stamp); font-weight: 600; }

/* --- body --- */
.vc-body { padding: 14px 26px 22px; }

.vc-title {
  margin: 0;
  font-weight: 700;
  font-size: clamp(22px, 5.8vw, 27px);
  letter-spacing: -.02em;
  line-height: 1.25;
}
.vc-lead {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--muted);
}

/* --- code inputs --- */
.vc-inputs {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.vc-cell {
  flex: 1 1 0;
  min-width: 0;
  height: 62px;
  border: 1.5px solid var(--rule);
  border-radius: 2px;
  background: #fff;
  color: var(--ink);
  font-family: var(--f-data);
  font-size: 26px;
  font-weight: 600;
  text-align: center;
  caret-color: var(--stamp);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
.vc-cell:focus {
  outline: none;
  border-color: var(--ink);
  box-shadow: 0 0 0 3px rgba(46, 23, 8, .12);
}
.vc-cell--error {
  border-color: var(--stamp);
  animation: vc-shake 320ms ease;
}
.vc-cell:disabled { opacity: .6; }
@keyframes vc-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* --- status --- */
.vc-status {
  margin: 14px 0 0;
  min-height: 20px;
  font-size: 13px;
  line-height: 1.5;
}
.vc-status--error { color: var(--stamp); font-weight: 500; }
.vc-status--ok { color: #2F6B3A; font-weight: 500; }
.vc-status--muted { color: var(--muted); }

/* --- perforation --- */
.vc-perf {
  position: relative;
  height: 0;
  border-top: 2px dashed var(--rule);
  margin: 4px 0 0;
}
.vc-notch {
  position: absolute;
  top: -11px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--field);
  box-shadow: 0 1px 2px rgba(74,28,4,.5) inset;
}
.vc-notch--l { left: -10px; }
.vc-notch--r { right: -10px; }

/* --- actions --- */
.vc-actions { padding: 24px 26px 26px; }
.vc-cta {
  width: 100%;
  border: 0;
  border-radius: 2px;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--f-body);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: .04em;
  padding: 15px 16px;
  cursor: pointer;
  transition: transform 120ms ease, background 160ms ease, opacity 160ms ease;
}
.vc-cta:hover:not(:disabled) { background: #5A2E12; }
.vc-cta:active:not(:disabled) { transform: translateY(1px); }
.vc-cta:disabled { opacity: .45; cursor: not-allowed; }

.vc-link {
  display: block;
  width: 100%;
  margin-top: 12px;
  border: 0;
  background: none;
  color: var(--muted);
  font-family: var(--f-body);
  font-size: 13px;
  padding: 6px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.vc-link:hover:not(:disabled) { color: var(--ink); }
.vc-link:disabled { opacity: .5; cursor: not-allowed; }

.vc-cta:focus-visible,
.vc-link:focus-visible {
  outline: 3px solid var(--stamp);
  outline-offset: 2px;
}

/* --- responsive --- */
@media (max-width: 380px) {
  .vc-head, .vc-body, .vc-actions { padding-left: 18px; padding-right: 18px; }
  .vc-inputs { gap: 8px; }
  .vc-cell { height: 54px; font-size: 22px; }
}

/* --- reduced motion --- */
@media (prefers-reduced-motion: reduce) {
  .vc-stub, .vc-cell--error {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;
