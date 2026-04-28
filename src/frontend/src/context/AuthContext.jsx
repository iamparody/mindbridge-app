import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('mb_token');
    const storedUser = localStorage.getItem('mb_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('mb_token');
        localStorage.removeItem('mb_user');
      }
    }
    setLoading(false);
  }, []);

  function login(newToken, newUser) {
    localStorage.setItem('mb_token', newToken);
    localStorage.setItem('mb_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    client.post('/api/auth/logout').catch(() => {});
    localStorage.removeItem('mb_token');
    localStorage.removeItem('mb_user');
    setToken(null);
    setUser(null);
  }

  function updateUser(updates) {
    const updated = { ...user, ...updates };
    localStorage.setItem('mb_user', JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
