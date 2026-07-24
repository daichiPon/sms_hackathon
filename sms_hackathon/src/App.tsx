import React, { useState } from 'react';
import './App.css';

function App() {
  const [id, set_id] = useState('');
  const [pw, set_pw] = useState('');

  const handleChange_id = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_id(e.target.value);
  };
    const handleChange_pw = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_pw(e.target.value);
  };
  

  return (
    <div
      className="app"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
        <label className="input-label" htmlFor="id-input">
          ID
        </label>
        <input
          id="id-input"
          className="text-input"
          type="text"
          value={id}
          onChange={handleChange_id}
          placeholder="ここに入力"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
        <label className="input-label" htmlFor="pw-input">
          PW
        </label>
        <input
          id="pw-input"
          className="text-input"
          type="password"
          value={pw}
          onChange={handleChange_pw}
          placeholder="ここに入力"
        />
      </div>
    </div>
  );
}

export default App;
