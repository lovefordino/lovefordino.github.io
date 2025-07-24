import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DrawPage from './pages/DrawPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<DrawPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
