
import React, { useState, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, User } from './types';
import { api } from './services/api';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import { ToastContainer, showToast } from './components/Toast';

// Auth Context
interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: JSON.parse(localStorage.getItem('zn_user') || 'null'),
    token: localStorage.getItem('zn_token'),
    isAuthenticated: !!localStorage.getItem('zn_token'),
    loading: false
  });

  const login = async (email: string, pass: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { user, token } = await api.auth.login(email, pass);
      localStorage.setItem('zn_user', JSON.stringify(user));
      localStorage.setItem('zn_token', token);
      setState({ user, token, isAuthenticated: true, loading: false });
      showToast('Logged in successfully!', 'success');
    } catch (err: any) {
      setState(s => ({ ...s, loading: false }));
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { user, token } = await api.auth.signup(name, email, pass);
      localStorage.setItem('zn_user', JSON.stringify(user));
      localStorage.setItem('zn_token', token);
      setState({ user, token, isAuthenticated: true, loading: false });
      showToast('Account created successfully!', 'success');
    } catch (err: any) {
      setState(s => ({ ...s, loading: false }));
      showToast(err.message || 'Signup failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('zn_user');
    localStorage.removeItem('zn_token');
    setState({ user: null, token: null, isAuthenticated: false, loading: false });
    showToast('Logged out', 'info');
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('zn_user', JSON.stringify(userData));
    setState(s => ({ ...s, user: userData }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ToastContainer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
