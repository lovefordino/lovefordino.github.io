import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Swal from 'sweetalert2';

function AdminLoginPage() {
    const [pw, setPw] = useState('');
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = login(pw);
        if (success) {
            navigate('/admin');
        } else {
            Swal.fire({
                title: 'Oops!',
                text: '비밀번호가 틀렸습니다.',
                confirmButtonColor: '#85d8ea',
            });
        }
    };

    return (
        <div className='admin'>
            <h1>관리자 로그인</h1>
            <form className='admin-login' onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="관리자 비밀번호 입력"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                />
                <button className='btn-mint' type="submit">확인</button>
            </form>
        </div>
    );
}

export default AdminLoginPage;
