import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Проверяем, есть ли код в URL (возврат от osu!)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Чистим URL от кода, чтобы он не мешался
      window.history.replaceState({}, document.title, "/");
      
      // Отправляем код на твой бэкенд (тот файл, что ты скидывал ранее)
      axios.post('/api/auth', { code })
        .then(res => {
          setUser(res.data);
          localStorage.setItem('osu_session', JSON.stringify(res.data));
        })
        .catch(err => console.error("Auth error:", err))
        .finally(() => setLoading(false));
    } else {
      // 2. Если кода нет, проверяем сохраненную сессию
      const savedUser = localStorage.getItem('osu_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('osu_session');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Тот самый хук useAuth, который требует твой App.jsx
export const useAuth = () => useContext(AuthContext);