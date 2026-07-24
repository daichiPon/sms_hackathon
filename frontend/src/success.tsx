/* ------------------------------------------------------------------ *
 *  SMS 認証成功画面 — Delivery Receipt
 *  依存ライブラリなし。CSS は同ファイル内に同梱。
 * ------------------------------------------------------------------ */

export interface LoginSuccessProps {
  onContinue?: () => void;
  onUseAnotherNumber?: () => void;
}

/* --- helpers ------------------------------------------------------ */

function formatStampDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/* --- component ---------------------------------------------------- */

export default function LoginSuccess({ onContinue, onUseAnotherNumber }: LoginSuccessProps) {
  return (
    <div className="sms-field">
      <style>{CSS}</style>

      <article className="sms-stub" role="status" aria-live="polite">
        <div className="sms-airmail sms-airmail--top" aria-hidden="true" />

        <header className="sms-head">
          <span className="sms-eyebrow">SMS Delivery Receipt</span>
        </header>

        <div className="sms-body">
          <h1 className="sms-title">認証が完了しました</h1>
          <Postmark date={formatStampDate(new Date())} />
        </div>

        <div className="sms-perf" aria-hidden="true">
          <span className="sms-notch sms-notch--l" />
          <span className="sms-notch sms-notch--r" />
        </div>

        <footer className="sms-actions">
          <button type="button" className="sms-link" onClick={onUseAnotherNumber}>
            別の番号で認証する
          </button>
        </footer>

        <div className="sms-airmail sms-airmail--bottom" aria-hidden="true" />
      </article>
    </div>
  );
}

/* --- postmark ----------------------------------------------------- */

function Postmark({ date }: { date: string }) {
  return (
    <svg className="sms-stamp" viewBox="0 0 268 168" aria-hidden="true" focusable="false">
      <defs>
        <path
          id="sms-arc-top"
          d="M 22 84 A 62 62 0 0 1 146 84"
          fill="none"
        />
        <path
          id="sms-arc-bottom"
          d="M 30 84 A 54 54 0 0 0 138 84"
          fill="none"
        />
      </defs>

      <circle cx="84" cy="84" r="62" className="sms-stamp-ring" />
      <circle cx="84" cy="84" r="53" className="sms-stamp-ring sms-stamp-ring--thin" />

      <text className="sms-stamp-arc">
        <textPath href="#sms-arc-top" startOffset="50%" textAnchor="middle">
          SMS AUTHENTICATED
        </textPath>
      </text>
      <text className="sms-stamp-arc">
        <textPath href="#sms-arc-bottom" startOffset="50%" textAnchor="middle">
          {date}
        </textPath>
      </text>

      <line x1="34" y1="76" x2="134" y2="76" className="sms-stamp-rule" />
      <line x1="34" y1="98" x2="134" y2="98" className="sms-stamp-rule" />
      <text x="84" y="94" className="sms-stamp-word" textAnchor="middle">
        VERIFIED
      </text>

      <path
        d="M150 62 q14 -9 28 0 t28 0 t28 0 t28 0"
        className="sms-stamp-wave"
      />
      <path
        d="M150 84 q14 -9 28 0 t28 0 t28 0 t28 0"
        className="sms-stamp-wave"
      />
      <path
        d="M150 106 q14 -9 28 0 t28 0 t28 0 t28 0"
        className="sms-stamp-wave"
      />
    </svg>
  );
}

/* --- styles ------------------------------------------------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;700&display=swap');

.sms-field {
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
.sms-field::before {
  content: '';
  position: absolute;
  inset: -20%;
  background-image: radial-gradient(rgba(255,255,255,.22) 1px, transparent 1.4px);
  background-size: 14px 14px;
  opacity: .18;
  pointer-events: none;
}
.sms-field * { box-sizing: border-box; }

/* --- stub --- */
.sms-stub {
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
  animation: sms-settle 640ms cubic-bezier(.16,.9,.3,1) both;
}
@keyframes sms-settle {
  from { opacity: 0; transform: translateY(22px) scale(.985); }
  to   { opacity: 1; transform: none; }
}

.sms-airmail { height: 9px; }
.sms-airmail--top { border-radius: 3px 3px 0 0; }
.sms-airmail--bottom { border-radius: 0 0 3px 3px; }
.sms-airmail {
  background: repeating-linear-gradient(
    -45deg,
    var(--stamp) 0 9px,
    var(--paper) 9px 18px,
    var(--field) 18px 27px,
    var(--paper) 27px 36px
  );
}

/* --- header --- */
.sms-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 16px 26px 0;
}
.sms-eyebrow {
  font-family: var(--f-label);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--muted);
}

/* --- body --- */
.sms-body { position: relative; padding: 14px 26px 26px; min-height: 148px; }

.sms-title {
  margin: 0;
  font-family: var(--f-body);
  font-weight: 700;
  font-size: clamp(24px, 6.4vw, 30px);
  letter-spacing: -.02em;
  line-height: 1.25;
  animation: sms-rise 560ms cubic-bezier(.2,.8,.3,1) 120ms both;
}

@keyframes sms-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}

/* --- postmark --- */
.sms-stamp {
  position: absolute;
  right: 4px;
  bottom: -6px;
  width: 216px;
  height: 136px;
  color: var(--stamp);
  opacity: .9;
  mix-blend-mode: multiply;
  pointer-events: none;
  transform-origin: 32% 50%;
  animation: sms-stamp-in 620ms cubic-bezier(.2,1.5,.4,1) 900ms both;
}
@keyframes sms-stamp-in {
  from { opacity: 0; transform: scale(2.3) rotate(-34deg); }
  to   { opacity: .9; transform: scale(1) rotate(-13deg); }
}
.sms-stamp-ring { fill: none; stroke: currentColor; stroke-width: 4; }
.sms-stamp-ring--thin { stroke-width: 1.5; }
.sms-stamp-rule { stroke: currentColor; stroke-width: 1.5; }
.sms-stamp-wave { fill: none; stroke: currentColor; stroke-width: 4; stroke-linecap: round; }
.sms-stamp-arc {
  fill: currentColor;
  font-family: var(--f-label);
  font-weight: 700;
  font-size: 12.5px;
  letter-spacing: .16em;
}
.sms-stamp-word {
  fill: currentColor;
  font-family: var(--f-label);
  font-weight: 700;
  font-size: 17px;
  letter-spacing: .1em;
}

/* --- perforation --- */
.sms-perf {
  position: relative;
  height: 0;
  border-top: 2px dashed var(--rule);
  margin: 4px 0 0;
}
.sms-notch {
  position: absolute;
  top: -11px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--field);
  box-shadow: 0 1px 2px rgba(74,28,4,.5) inset;
}
.sms-notch--l { left: -10px; }
.sms-notch--r { right: -10px; }

/* --- actions --- */
.sms-actions { padding: 24px 26px 26px; animation: sms-rise 500ms ease-out 1150ms both; }
.sms-cta {
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
  transition: transform 120ms ease, background 160ms ease;
}
.sms-cta:hover { background: #5A2E12; }
.sms-cta:active { transform: translateY(1px); }
.sms-link {
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
.sms-link:hover { color: var(--ink); }

.sms-cta:focus-visible,
.sms-link:focus-visible {
  outline: 3px solid var(--stamp);
  outline-offset: 2px;
}

/* --- responsive --- */
@media (max-width: 380px) {
  .sms-head, .sms-body, .sms-actions { padding-left: 18px; padding-right: 18px; }
  .sms-stamp { width: 176px; height: 110px; bottom: -2px; }
}

/* --- reduced motion --- */
@media (prefers-reduced-motion: reduce) {
  .sms-stub, .sms-title, .sms-stamp, .sms-actions {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .sms-stamp { transform: rotate(-13deg) !important; }
  .sms-countdown-fill { animation: none !important; transform: scaleX(0); }
}
`;