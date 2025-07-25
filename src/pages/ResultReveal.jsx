// ResultReveal.jsx
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import useDrawStore from '../store/useDrawStore';
import heart from '../img/heart.png';

function ResultReveal({ results, mode = 'all', onFinish }) {
    const [index, setIndex] = useState(0);
    const [isSuspense, setIsSuspense] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [showFinalSummary, setShowFinalSummary] = useState(false);

    const { displayMode } = useDrawStore();

    const isHighRank = (item) => {
        if (!item) return false;
        return item.rank === 1 || item.rank === 2;
    };

    const sortedResults = [...results].sort((a, b) => b.rank - a.rank);

    const stepResults = mode === 'step'
        ? sortedResults.flatMap((r) => Array.from({ length: r.count }, () => ({ rank: r.rank, name: r.name })))
        : sortedResults;

    const current = stepResults[index];

    useEffect(() => {
        if (mode === 'all') {
            const hasHighRank = sortedResults.some((r) => isHighRank(r));
            if (hasHighRank) {
                setIsSuspense(true);
            } else {
                setIsRevealed(true);
            }
        }
    }, []);

    useEffect(() => {
        if (mode === 'step') {
            const now = stepResults[index];
            if (!now) return;
            if (isHighRank(now)) {
                setIsSuspense(true);
            } else {
                setIsSuspense(false);
                setIsRevealed(true);
            }
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
                setShowFinalSummary(true);
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
        <div className="draw-contents">
            {showConfetti && <Confetti />}

            {isSuspense && !isRevealed ? (
                <div>
                    <div className='pluse' onClick={handleReveal}>
                        ♥
                    </div>
                </div>
            ) : showFinalSummary ? (
                <div>
                    <h2 className='draw-result'>전체 당첨 결과</h2>
                    <ul>
                        {sortedResults.map((r, i) => (
                            <li key={i}>{renderLabel(r)} ({r.count}개)</li>
                        ))}
                    </ul>
                    <button className='btn-mint go-draw' onClick={onFinish}>확인 완료</button>
                </div>
            ) : (
                isRevealed && (
                    <div>
                        {mode === 'step' ? (
                            <>
                                <ul>
                                    <li>{renderLabel(current)}</li>
                                </ul>
                                <button className='btn-mint go-draw' onClick={handleNext}>
                                    {index < stepResults.length - 1 ? '다음' : '전체 결과 보기'}
                                </button>
                            </>
                        ) : (
                            <>
                                <h2>전체 당첨 결과</h2>
                                <ul>
                                    {sortedResults.map((r, i) => (
                                        <li key={i}>{renderLabel(r)} ({r.count}개)</li>
                                    ))}
                                </ul>
                                <button className='btn-mint go-draw' onClick={onFinish}>확인 완료</button>
                            </>
                        )}
                    </div>
                )
            )}
        </div>
    );
}

export default ResultReveal;