import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../mock/mockUsers';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bitsathy_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [error, setError] = useState(null);

  const loginWithGoogle = async (googleCredentialResponse) => {
    const email = googleCredentialResponse.email || "adithya.cs21@bitsathy.ac.in";
    
    if (!email.endsWith("@bitsathy.ac.in")) {
      const errMsg = "Unauthorized: Access restricted to Bannari Amman Institute of Technology members only (@bitsathy.ac.in).";
      setError(errMsg);
      return { success: false, error: errMsg };
    }

    try {
      const data = await api.devLogin(email);
      const authenticatedUser = {
        ...data.user,
        avatar: googleCredentialResponse.picture || ""
      };
      
      setUser(authenticatedUser);
      localStorage.setItem('bitsathy_token', data.token);
      localStorage.setItem('bitsathy_user', JSON.stringify(authenticatedUser));
      setError(null);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const loginAsRole = async (role) => {
    let email = "adithya.cs21@bitsathy.ac.in";
    if (role === 'faculty') email = "rajeshkumar.fac@bitsathy.ac.in";
    else if (role === 'staff') email = "subramanian.stf@bitsathy.ac.in";
    else if (role === 'admin') email = "admin.governance@bitsathy.ac.in";

    try {
      const data = await api.devLogin(email);
      setUser(data.user);
      localStorage.setItem('bitsathy_token', data.token);
      localStorage.setItem('bitsathy_user', JSON.stringify(data.user));
      setError(null);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bitsathy_user');
    localStorage.removeItem('bitsathy_token');
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, error, setError, loginWithGoogle, loginAsRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
