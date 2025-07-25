// ResultReveal.jsx
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import useDrawStore from '../store/useDrawStore';
import ImageCaptureQR from '../components/ImageCaptureQR';

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
            {showConfetti && (
                <Confetti
                    className="no-capture" 
                    numberOfPieces={80}
                    run={true}
                    gravity={0.3}
                />
            )}

            {isSuspense && !isRevealed ? (
                <div>
                    <div className='pluse' onClick={handleReveal}>
                        <span>♥</span>
                    </div>
                </div>
            ) : showFinalSummary ? (
                <div>
                    <h2 className='draw-result'>전체 당첨 결과</h2>
                    <ul>
                        {sortedResults.map((r, i) => (
                            <li className='fade-in' key={i}>{renderLabel(r)} ({r.count}개)</li>
                        ))}
                    </ul>
                    <button className='btn-mint go-draw no-capture' onClick={onFinish}>확인 완료</button>
                    {sortedResults.some((r) => isHighRank(r)) && <ImageCaptureQR />}
                </div>
            ) : (
                isRevealed && (
                    <div>
                        {mode === 'step' ? (
                            <>
                                <ul>
                                    <li className='fade-in'>{renderLabel(current)}</li>
                                </ul>
                                <button className='btn-mint go-draw' onClick={handleNext}>
                                    {index < stepResults.length - 1 ? '다음' : '전체 결과 보기'}
                                </button>
                                {isHighRank(current) && <ImageCaptureQR />}
                            </>
                        ) : (
                            <>
                                <h2>전체 당첨 결과</h2>
                                <ul>
                                    {sortedResults.map((r, i) => (
                                        <li className='fade-in' key={i}>{renderLabel(r)} ({r.count}개)</li>
                                    ))}
                                </ul>
                                <button className='btn-mint go-draw no-capture' onClick={onFinish}>확인 완료</button>
                                {sortedResults.some((r) => isHighRank(r)) && <ImageCaptureQR />}
                            </>
                        )}
                    </div>
                )
            )}
        </div>
    );
}

export default ResultReveal;