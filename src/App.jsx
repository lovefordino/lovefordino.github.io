import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import DrawPage from './pages/DrawPage';
import AdminLoginPage from './pages/AdminLoginPage';
import useAuthStore from './store/useAuthStore';

function App() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DrawPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={isAdmin ? <AdminPage /> : <Navigate to="/admin-login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
