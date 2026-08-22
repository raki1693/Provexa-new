import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth state from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('provexa_token');
    const storedUser = localStorage.getItem('provexa_user');
    const storedRole = localStorage.getItem('provexa_role');

    if (storedToken && storedUser && storedRole) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
      } catch {
        localStorage.removeItem('provexa_token');
        localStorage.removeItem('provexa_user');
        localStorage.removeItem('provexa_role');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken, newUser, newRole) => {
    localStorage.setItem('provexa_token', newToken);
    localStorage.setItem('provexa_user', JSON.stringify(newUser));
    localStorage.setItem('provexa_role', newRole);
    setToken(newToken);
    setUser(newUser);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('provexa_token');
    localStorage.removeItem('provexa_user');
    localStorage.removeItem('provexa_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, role, token, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
