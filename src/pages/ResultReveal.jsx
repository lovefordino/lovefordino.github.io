// ResultReveal.jsx
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import useDrawStore from '../store/useDrawStore';

function ResultReveal({ results, mode = 'all', onFinish }) {
    const [index, setIndex] = useState(0);
    const [isSuspense, setIsSuspense] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    const { displayMode } = useDrawStore();

    const isHighRank = (item) => item.rank === 1 || item.rank === 2;

    const shuffle = (arr) => {
        return [...arr].sort(() => Math.random() - 0.5);
    };

    const stepResults = mode === 'step'
        ? shuffle(results.flatMap((r) => Array.from({ length: r.count }, () => ({ rank: r.rank, name: r.name }))))
        : results;

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

    const renderLabel = (item) => {
        if (displayMode === 'rank') return `${item.rank}등`;
        if (displayMode === 'prize') return `${item.name}`;
        return `${item.rank}등 - ${item.name}`;
    };

    return (
        <div className="result-reveal-wrapper">
            {showConfetti && <Confetti />}

            {isSuspense && !isRevealed ? (
                <div>
                    <h2>두근두근...!</h2>
                    <p>클릭하여 확인하세요</p>
                    <button onClick={handleReveal}>확인</button>
                </div>
            ) : (
                isRevealed && (
                    <div>
                        {mode === 'step' ? (
                            <>
                                <h2>{renderLabel(current)}</h2>
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
                                        <li key={i}>{renderLabel(r)} ({r.count}개)</li>
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
