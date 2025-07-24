// DrawPage.jsx
import React, { useEffect, useState } from 'react';
import useDrawStore from '../store/useDrawStore';
import ResultReveal from './ResultReveal';

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
        setShowResult(true);
    };

    const reset = () => {
        setShowResult(false);
        setResults([]);
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>럭키드로우</h1>

            {showResult ? (
                <ResultReveal results={results} mode={mode} onFinish={reset} />
            ) : (
                <>
                    {isUnavailable ? (
                        <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '1rem' }}>
                            럭키드로우가 마감되었습니다.
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>총 남은 수량: {totalRemaining}개</strong>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label>뽑을 개수: </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={drawCount}
                                    onChange={(e) => setDrawCount(Number(e.target.value))}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label>결과 보기 방식: </label>
                                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                                    <option value="all">한번에 보기</option>
                                    <option value="step">하나씩 보기</option>
                                </select>
                            </div>

                            <button onClick={draw} disabled={drawCount < 1}>
                                추첨하기
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default DrawPage;
