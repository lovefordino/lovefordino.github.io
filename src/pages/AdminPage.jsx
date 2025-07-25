import React, { useEffect } from 'react';
import useDrawStore from '../store/useDrawStore';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import './css/admin.css';
import { Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

function AdminPage() {
    const {
        prizes,
        displayMode,
        isLocked,
        isClosed,
        addPrize,
        updatePrize,
        deletePrize,
        setDisplayMode,
        setLocked,
        setClosed,
        saveToFirebase,
        loadFromFirebase,
        listenToFirebase,
    } = useDrawStore();

    const isAdmin = useAuthStore((s) => s.isAdmin);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            console.log('[Auth] 비로그인 상태 → /admin-login으로 이동');
            navigate('/admin-login');
        } else {
            console.log('[Auth] 로그인됨');
        }
    }, [isAdmin]);

    useEffect(() => {
        loadFromFirebase();
        listenToFirebase();
    }, []);

    return (
        <div className='admin'>
            <div className="admin-header">
                <h1>관리자 페이지 <span>※ 상품 추가/삭제 및 결과 표시 방식 변경 후에는 ‘저장하기’를 눌러야 반영됩니다.</span></h1>
                <div className="admin-status">
                    <button
                        className='btn-red'
                        onClick={async () => {
                            const result = await Swal.fire({
                                title: isClosed ? '럭키드로우를 다시 여시겠습니까?' : '정말로 지금 마감하시겠습니까?',
                                showCancelButton: true,
                                confirmButtonText: isClosed ? '다시 열기' : '마감하기',
                                cancelButtonText: '취소',
                                confirmButtonColor: '#00c67e',
                            });

                            if (!result.isConfirmed) return;

                            const newClosed = !isClosed;
                            setClosed(newClosed);
                            await saveToFirebase();

                            await Swal.fire({
                                title: newClosed ? '마감되었습니다.' : '럭키드로우를 다시 열었습니다.',
                                confirmButtonColor: '#00c67e',
                            });

                            window.location.reload();
                        }}
                    >
                        {isClosed ? '다시열기' : '마감하기'}
                    </button>
                </div>
            </div>
            <div className="admin-table">
                <table border="1" cellPadding="8">
                    <thead>
                        <tr>
                            <th>등수</th>
                            <th>상품명</th>
                            <th>전체 수량</th>
                            <th>남은 수량</th>
                            <th>삭제</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prizes.map((prize, index) => (
                            <tr key={index}>
                                <td>{prize.rank}등</td>
                                <td>
                                    <input
                                        type="text"
                                        value={prize.name}
                                        disabled={isLocked}
                                        onChange={(e) => updatePrize(index, { name: e.target.value })}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={prize.quantity}
                                        disabled={isLocked}
                                        onChange={(e) => {
                                            const quantity = parseInt(e.target.value);
                                            updatePrize(index, {
                                                quantity,
                                                remaining: quantity,
                                            });
                                        }}
                                    />
                                </td>
                                <td>{prize.remaining}</td>
                                <td>
                                    <button
                                        className='delete-prize'
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: `${prize.rank}등 상품 "${prize.name}"을 삭제하시겠습니까?`,
                                                showCancelButton: true,
                                                confirmButtonText: '삭제',
                                                cancelButtonText: '취소',
                                                confirmButtonColor: '#00c67e',
                                            });
                                            if (result.isConfirmed) {
                                                deletePrize(index);
                                                Swal.fire({
                                                    title: '삭제되었습니다.',
                                                    text: '(반드시 저장버튼을 눌러주세요)',
                                                    confirmButtonColor: '#00c67e',
                                                });
                                            }
                                        }}
                                        disabled={isLocked}
                                    >
                                        <Trash2 size={20} strokeWidth={1.5} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="admin-btn-wrapper">
                <button className='lock-prize btn-white' onClick={() => setLocked(!isLocked)}>
                    {isLocked ? '잠금해제' : '설정잠금'}
                </button>
                <button className='add-prize btn-white' onClick={addPrize} disabled={isLocked || prizes.length >= 10}>
                    상품추가
                </button>
            </div>
            <div className='admin-wrapper'>
                <div className="admin-row">
                    <h2>결과 표시 방식</h2>
                    <label>
                        <input
                            type="radio"
                            value="rank"
                            checked={displayMode === 'rank'}
                            disabled={isLocked}
                            onChange={(e) => setDisplayMode(e.target.value)}
                        /> 등수만
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="prize"
                            checked={displayMode === 'prize'}
                            disabled={isLocked}
                            onChange={(e) => setDisplayMode(e.target.value)}
                        /> 상품명만
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="both"
                            checked={displayMode === 'both'}
                            disabled={isLocked}
                            onChange={(e) => setDisplayMode(e.target.value)}
                        /> 둘 다
                    </label>
                </div>
            </div>
            <div className="admin-footer">
                <button
                    className='btn-mint'
                    onClick={async () => {
                        const result = await Swal.fire({
                            title: '저장하시겠습니까?',
                            showCancelButton: true,
                            confirmButtonText: '저장',
                            cancelButtonText: '취소',
                            confirmButtonColor: '#00c67e',
                        });
                        if (!result.isConfirmed) return;

                        await saveToFirebase();
                        await Swal.fire({
                            title: '저장되었습니다!',
                            confirmButtonColor: '#00c67e',
                        });
                        window.location.reload();
                    }}
                >
                    저장하기
                </button>
            </div>
        </div>
    );
}

export default AdminPage;
