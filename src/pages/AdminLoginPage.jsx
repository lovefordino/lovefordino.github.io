// src/pages/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebaseAuth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';

function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, pw);
            const token = await userCred.user.getIdTokenResult();

            if (token.claims.isAdmin) {
                navigate('/admin');
            } else {
                await Swal.fire({
                    title: '권한 없음',
                    text: '관리자 권한이 없습니다.',
                    confirmButtonColor: '#85d8ea',
                });
            }
        } catch (err) {
            await Swal.fire({
                title: '로그인 실패',
                text: err.message,
                confirmButtonColor: '#85d8ea',
            });
        }
    };

    return (
        <div className='admin'>
            <h1>관리자 로그인</h1>
            <form className='admin-login' onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                />
                <button className='btn-mint' type="submit">확인</button>
            </form>
        </div>
    );
}

export default AdminLoginPage;
