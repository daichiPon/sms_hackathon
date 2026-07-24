import React, { useRef, useState } from 'react';
import './App.css';
import VerifyCode from './VerifyCode';
import LoginSuccess from './success';
import { ApiError, networkError, toApiError } from './apiError';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3001';
const SMS_CODE_LENGTH = 4;

type Step = 'login' | 'verify' | 'success';

function App() {
  const [form, setForm] = useState({ id: '', password: '' });
  const [step, setStep] = useState<Step>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | undefined>();
  const passwordRef = useRef('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /** API を叩き、エラーレスポンスは ApiError に変換して throw する */
  const postJson = async <T,>(path: string, body: unknown): Promise<T> => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw networkError();
    }

    if (!res.ok) {
      throw await toApiError(res);
    }

    return (await res.json()) as T;
  };

  const requestSmsCode = async (id: string, password: string) => {
    const data = await postJson<{ expiresAt?: string }>('/auth/login', { id, password });
    setExpiresAt(data.expiresAt);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestSmsCode(form.id, form.password);
      passwordRef.current = form.password;
      setForm(prev => ({ ...prev, password: '' }));
      setStep('verify');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.displayMessage : 'ネットワークエラーが発生しました'
      );
    } finally {
      setLoading(false);
    }
  };

  // 入力コードと送信済みコードの一致をサーバー側で検証する
  const handleVerify = async (code: string) => {
    try {
      await postJson('/auth/verify-sms', { id: form.id, code });
    } catch (err) {
      throw new Error(
        err instanceof ApiError ? err.displayMessage : 'ネットワークエラーが発生しました'
      );
    }

    passwordRef.current = '';
    setStep('success');
  };

  const handleResend = async () => {
    try {
      await requestSmsCode(form.id, passwordRef.current);
    } catch (err) {
      throw new Error(
        err instanceof ApiError ? err.displayMessage : 'ネットワークエラーが発生しました'
      );
    }
  };

  const resetToLogin = () => {
    passwordRef.current = '';
    setForm({ id: '', password: '' });
    setExpiresAt(undefined);
    setError('');
    setStep('login');
  };

  if (step === 'success') {
    return <LoginSuccess onUseAnotherNumber={resetToLogin} />;
  }

  if (step === 'verify') {
    return (
      <VerifyCode
        length={SMS_CODE_LENGTH}
        expiresAt={expiresAt}
        onVerify={handleVerify}
        onResend={handleResend}
        onBack={resetToLogin}
      />
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="id">ID</label>
      <input id="id" name="id" value={form.id} onChange={handleChange} />

      <label htmlFor="password">PW</label>
      <input
        id="password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? '送信中...' : 'ログイン'}
      </button>
    </form>
  );
}

export default App;
