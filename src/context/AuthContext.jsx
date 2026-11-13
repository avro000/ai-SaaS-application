import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nexusai_token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('nexusai_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('nexusai_token');
          localStorage.removeItem('nexusai_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('nexusai_user');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('nexusai_token', res.data.token);
    localStorage.setItem('nexusai_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const loginWithGoogle = async (token) => {
    const res = await api.post('/auth/google', { token });
    localStorage.setItem('nexusai_token', res.data.token);
    localStorage.setItem('nexusai_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  };

  const resendOtp = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('nexusai_token');
    localStorage.removeItem('nexusai_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
