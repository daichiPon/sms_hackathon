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
    <div className="app">
      <div className="input-card">
        <label className="input-label" htmlFor="text-input">
          ID
        </label>
        <input
          id="text-input"
          className="text-input"
          type="text"
          value={id}
          onChange={handleChange_id}
          placeholder="ここに入力"
        />
      </div>

      <div className="input-card">
        <label className="input-label" htmlFor="text-input">
          PW
        </label>
        <input
          id="text-input"
          className="text-input"
          type="text"
          value={pw}
          onChange={handleChange_pw}
          placeholder="ここに入力"
        />
      </div>
    </div>
  );
}

export default App;
