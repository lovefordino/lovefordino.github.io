// DrawPage.jsx
import React, { useEffect, useState } from 'react';
import useDrawStore from '../store/useDrawStore';
import ResultReveal from './ResultReveal';
import './css/draw.css';
import { Plus, Minus } from 'lucide-react';

function DrawPage() {
    const {
        prizes,
        isLocked,
        isClosed,
        loadFromFirebase,
        updatePrize,
        saveToFirebase
    } = useDrawStore();

    const [drawCount, setDrawCount] = useState(1);
    const [results, setResults] = useState([]);
    const [mode, setMode] = useState('all'); // all or step
    const [showResult, setShowResult] = useState(false);
    const [finalMode, setFinalMode] = useState('all'); // ✅ 실제 전달할 mode

    useEffect(() => {
        loadFromFirebase();
    }, []);

    const totalRemaining = prizes.reduce((sum, p) => sum + p.remaining, 0);
    const isFinished = totalRemaining === 0;
    const isUnavailable = isFinished || isClosed;

    const buildDrawPool = () => {
        const pool = [];
        prizes.forEach((prize) => {
            for (let i = 0; i < prize.remaining; i++) {
                pool.push(prize.rank);
            }
        });
        return pool;
    };

    const getPrizeByRank = (rank) => prizes.find((p) => p.rank === rank);

    const groupResults = (drawnRanks) => {
        const grouped = {};
        drawnRanks.forEach((rank) => {
            const prize = getPrizeByRank(rank);
            const key = `${rank}-${prize.name}`;
            if (!grouped[key]) {
                grouped[key] = { rank, name: prize.name, count: 1 };
            } else {
                grouped[key].count += 1;
            }
        });
        return Object.values(grouped);
    };

    const draw = () => {
        const pool = buildDrawPool();

        if (pool.length < drawCount) {
            alert('남은 상품 수량보다 더 많이 뽑을 수 없습니다!');
            return;
        }

        const drawnRanks = [];
        const updatedPrizes = [...prizes];

        for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            const selectedRank = pool[randomIndex];
            drawnRanks.push(selectedRank);
            const firstIndex = pool.indexOf(selectedRank);
            pool.splice(firstIndex, 1);
            const target = updatedPrizes.find((p) => p.rank === selectedRank);
            if (target) {
                target.remaining -= 1;
            }
        }

        updatedPrizes.forEach((p, index) => {
            updatePrize(index, { remaining: p.remaining });
        });
        saveToFirebase();

        const grouped = groupResults(drawnRanks);
        setResults(grouped);
        setFinalMode(drawCount === 1 ? 'all' : mode); // ✅ 실제 mode 결정
        setShowResult(true);
    };

    const reset = () => {
        setShowResult(false);
        setResults([]);
    };

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 여기에서 관리자 상태 확인 (예: Firebase Auth, 로컬스토리지, 세션 등)
        const adminLoggedIn = localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminLoggedIn);
    }, []);

    return (
        <div className='draw'>
            <div className="copy no-capture">Copyright 2025. Dingdongsun. All rights reserved.</div>
            <h1>Lucky Draw</h1>
            <p>안내문구가 노출됩니다.</p>
            <div className='draw-wrapper'>
                {showResult ? (
                    <ResultReveal results={results} mode={finalMode} onFinish={reset} />  // ✅ 변경됨
                ) : (
                    <div className='draw-contents'>
                        {isUnavailable ? (
                            <div>
                                럭키드로우가 마감되었습니다.
                            </div>
                        ) : (
                            <>
                                <div className='draw-row'>
                                    <div className="draw-count-control">
                                        <button
                                            className='minus'
                                            type="button"
                                            onClick={() => setDrawCount((prev) => Math.max(1, prev - 1))}
                                        ><Minus /></button>

                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={drawCount}
                                            onChange={(e) => setDrawCount(Number(e.target.value))}
                                        />

                                        <button
                                            className='plus'
                                            type="button"
                                            onClick={() => setDrawCount((prev) => Math.min(100, prev + 1))}
                                        ><Plus /></button>
                                    </div>
                                </div>

                                {/* 보기 모드 사용시 */}

                                {/* <div className='draw-row'>
                                    <select value={mode} onChange={(e) => setMode(e.target.value)}>
                                        <option value="all">한번에 보기</option>
                                        <option value="step">하나씩 보기</option>
                                    </select>
                                </div> */}

                                <button className='btn-mint go-draw' onClick={draw} disabled={drawCount < 1}>
                                    Draw!
                                </button>
                                <a
                                    href={isAdmin ? '/#/admin' : '/#/admin-login'}
                                    className="go-admin"
                                >
                                    {isAdmin ? '관리자 페이지로 이동' : '관리자로 로그인'}
                                </a>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DrawPage;
