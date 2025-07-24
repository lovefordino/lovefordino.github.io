// ResultReveal.jsx
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

function ResultReveal({ results, mode = 'all', onFinish }) {
    const [index, setIndex] = useState(0);
    const [isSuspense, setIsSuspense] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    const isHighRank = (item) => item.rank === 1 || item.rank === 2;

    // step 모드일 경우 개별 리스트 펼치기
    const stepResults = mode === 'step' ? results.flatMap((r) => Array.from({ length: r.count }, () => ({ rank: r.rank, name: r.name }))) : results;
    const current = stepResults[index];

    useEffect(() => {
        if (mode === 'all') {
            const hasHighRank = results.some((r) => r.rank === 1 || r.rank === 2);
            if (hasHighRank) setIsSuspense(true);
            else setIsRevealed(true);
        } else {
            if (isHighRank(current)) setIsSuspense(true);
            else setIsRevealed(true);
        }
    }, [index]);

    const handleReveal = () => {
        setIsSuspense(false);
        setShowConfetti(true);
        setTimeout(() => {
            setIsRevealed(true);
        }, 300);
    };

    const handleNext = () => {
        setShowConfetti(false);
        setIsRevealed(false);
        setIndex((prev) => {
            if (prev + 1 >= stepResults.length) {
                onFinish?.();
                return prev;
            }
            return prev + 1;
        });
    };

    return (
        <div className="result-reveal-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
            {showConfetti && <Confetti />}

            {isSuspense && !isRevealed ? (
                <div>
                    <h2 style={{ fontSize: '2rem', animation: 'pulse 1s infinite' }}>두근두근...!</h2>
                    <p>클릭하여 확인하세요</p>
                    <button onClick={handleReveal}>확인</button>
                </div>
            ) : (
                isRevealed && (
                    <div>
                        {mode === 'step' ? (
                            <>
                                <h2>{current.rank}등 - {current.name}</h2>
                                {index < stepResults.length - 1 ? (
                                    <button onClick={handleNext}>다음</button>
                                ) : (
                                    <button onClick={onFinish}>확인 완료</button>
                                )}
                            </>
                        ) : (
                            <>
                                <h2>🎉 전체 당첨 결과 🎉</h2>
                                <ul>
                                    {results.map((r, i) => (
                                        <li key={i}>{r.rank}등 - {r.name} ({r.count}개)</li>
                                    ))}
                                </ul>
                                <button onClick={onFinish}>확인 완료</button>
                            </>
                        )}
                    </div>
                )
            )}
        </div>
    );
}

export default ResultReveal;
