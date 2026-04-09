import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUsers = [] }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("hotseat_currentUser");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const [showLogin, setShowLogin] = useState(false);

  const login = useCallback((user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("hotseat_currentUser", JSON.stringify(user));
    } catch (e) {}
    setShowLogin(false);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("hotseat_currentUser");
    } catch (e) {}
  }, []);

  const requireLogin = useCallback(() => {
    if (!currentUser) {
      setShowLogin(true);
      return false;
    }
    return true;
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, requireLogin, showLogin, setShowLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}