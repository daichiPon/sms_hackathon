import React, { useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({ id: '', pw: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // Cookieでセッション受け取る場合
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('IDまたはパスワードが違います');
      }

      const data = await res.json();
      console.log(data);
      setForm(prev => ({ ...prev, pw: '' }));

    } catch (err) {
      setError(err instanceof Error ? err.message : '通信エラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
    onSubmit={handleSubmit}
    style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
      >
      <input name="id" value={form.id} onChange={handleChange} />
      <input name="pw" type="password" value={form.pw} onChange={handleChange} />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button style={{marginTop:20}} type="submit" disabled={loading}>
        {loading ? '送信中...' : 'ログイン'}
      </button>
    </form>
  );
}

export default App;
