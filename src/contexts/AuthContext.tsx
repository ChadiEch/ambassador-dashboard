// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextProps {
  userId: string | null;
  role: string | null;
  login: (userId: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  userId: null,
  role: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem('userId'));
    setRole(localStorage.getItem('role'));
  }, []);

  const login = (id: string, userRole: string) => {
    localStorage.setItem('userId', id);
    localStorage.setItem('role', userRole);
    setUserId(id);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.clear();
    setUserId(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ userId, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
