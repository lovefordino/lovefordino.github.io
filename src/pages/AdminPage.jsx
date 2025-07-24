import React, { useEffect } from 'react';
import useDrawStore from '../store/useDrawStore';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

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
        <div style={{ padding: '2rem' }}>
            <h1>관리자 페이지</h1>

            <h2>상품 설정</h2>
            <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: '1rem' }}>
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
                                    onClick={() => deletePrize(index)}
                                    disabled={isLocked}
                                    style={{ color: 'red' }}
                                >
                                    🗑
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={addPrize} disabled={isLocked || prizes.length >= 10}>
                상품 추가
            </button>

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

            <div style={{ marginTop: '1rem' }}>
                <button onClick={() => setLocked(!isLocked)}>
                    {isLocked ? '설정 해제' : '설정 잠금'}
                </button>
            </div>
            
            <button
                onClick={async () => {
                    await saveToFirebase();
                    window.location.reload(); // ✅ 저장 후 새로고침
                }}
            >
                저장
            </button>

            <h2>🚪 럭키드로우 마감 설정</h2>
            <p>
                현재 상태: <strong>{isClosed ? '마감됨 🔒' : '열림 🔓'}</strong>
            </p>
            <button onClick={() => setClosed(!isClosed)}>
                {isClosed ? '🔓 다시 열기' : '🔒 마감하기'}
            </button>

        </div>
    );
}

export default AdminPage;
