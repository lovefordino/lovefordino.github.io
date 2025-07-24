import React, { useEffect, useState } from 'react';
import useDrawStore from '../store/useDrawStore';

function DrawPage() {
    const {
        prizes,
        isLocked,
        loadFromFirebase,
        updatePrize,
        saveToFirebase
    } = useDrawStore();

    const [drawCount, setDrawCount] = useState(1);
    const [results, setResults] = useState([]);

    useEffect(() => {
        loadFromFirebase();
    }, []);

    // 전체 남은 수량
    const totalRemaining = prizes.reduce((sum, p) => sum + p.remaining, 0);
    const isFinished = totalRemaining === 0;

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

            // pool에서 해당 rank 하나 제거
            const firstIndex = pool.indexOf(selectedRank);
            pool.splice(firstIndex, 1);

            // 상태에서도 해당 상품 수량 차감
            const target = updatedPrizes.find((p) => p.rank === selectedRank);
            if (target) {
                target.remaining -= 1;
            }
        }

        // 상태 반영
        updatedPrizes.forEach((p, index) => {
            updatePrize(index, { remaining: p.remaining });
        });
        saveToFirebase();

        const grouped = groupResults(drawnRanks);
        setResults(grouped);
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>럭키드로우</h1>

            {isFinished ? (
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
                        <button onClick={draw} disabled={drawCount < 1}>
                            추첨하기
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default DrawPage;
