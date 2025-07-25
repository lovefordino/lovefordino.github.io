import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import DrawPage from './pages/DrawPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ShippingListAdmin from './pages/ShippingListAdmin';
import RequireAdmin from './components/RequireAdmin';
import useAuthStore from './store/useAuthStore';
import './App.css'

function App() {
  const listenAuthState = useAuthStore((s) => s.listenAuthState);

  useEffect(() => {
    listenAuthState(); // 앱 시작 시 한 번만 실행
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DrawPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route
          path="/admin/shipping"
          element={
            <RequireAdmin>
              <ShippingListAdmin />
            </RequireAdmin>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;