import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      window.history.replaceState({}, document.title, "/");
      axios.post('/api/get-user', { code })
        .then(res => {
          setUser(res.data);
          localStorage.setItem('osu_session', JSON.stringify(res.data));
        })
        .catch(err => console.error("Auth error:", err))
        .finally(() => setLoading(false));
    } else {
      const savedUser = localStorage.getItem('osu_session');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('osu_session');
        }
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

export const useAuth = () => useContext(AuthContext);