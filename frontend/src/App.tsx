import React, { useState } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3001';

function App() {
  const [form, setForm] = useState({ id: '', password: '', code: '' });
  const [step, setStep] = useState<'login' | 'sms'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          password: form.password,
        }),
      });

      if (!res.ok) {
        throw new Error('IDまたはパスワードが違います');
      }

      setForm(prev => ({ ...prev, password: '' }));
      setStep('sms');
      setMessage('SMSコードを送信しました');
    } catch (err) {
      setError(err instanceof Error ? err.message : '通信エラー');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySms = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          code: form.code.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('SMSコードが違います');
      }

      setMessage('ログイン成功');
    } catch (err) {
      setError(err instanceof Error ? err.message : '通信エラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="auth-form"
      onSubmit={step === 'login' ? handleSubmit : handleVerifySms}
    >
      {step === 'login' ? (
        <>
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
        </>
      ) : (
        <>
          <label htmlFor="code">SMS code</label>
          <input id="code" name="code" value={form.code} onChange={handleChange} />
        </>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <button type="submit" disabled={loading}>
        {loading ? '送信中...' : step === 'login' ? 'ログイン' : '確認'}
      </button>
    </form>
  );
}

export default App;
