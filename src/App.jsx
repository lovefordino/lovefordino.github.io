import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import DrawPage from './pages/DrawPage';
import AdminLoginPage from './pages/AdminLoginPage';
import useAuthStore from './store/useAuthStore';

function App() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DrawPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
