import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

function AdminLoginPage() {
    const [pw, setPw] = useState('');
    const [error, setError] = useState('');
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = login(pw);
        if (success) {
            navigate('/admin');
        } else {
            setError('비밀번호가 틀렸습니다.');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>관리자 로그인</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="관리자 비밀번호 입력"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                />
                <button type="submit">확인</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default AdminLoginPage;
