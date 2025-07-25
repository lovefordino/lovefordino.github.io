// ResultReveal.jsx
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import useDrawStore from '../store/useDrawStore';
import ShippingFormModal from './ShippingFormModal';
import ImageCaptureQR from '../components/ImageCaptureQR';
import { useNavigate } from 'react-router-dom';

function ResultReveal({ results, mode = 'all', onFinish }) {
    const [index, setIndex] = useState(0);
    const [isSuspense, setIsSuspense] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [showFinalSummary, setShowFinalSummary] = useState(false);

    const { displayMode, prizes } = useDrawStore(); // ✅ prizes 포함
    const [showShippingModal, setShowShippingModal] = useState(false);

    const isHighRank = (item) => {
        if (!item) return false;
        return item.rank === 1 || item.rank === 2;
    };

    const sortedResults = [...results].map((r) => {
        const matched = prizes.find((p) => p.rank === r.rank && p.name === r.name);
        return {
            ...r,
            requiresShipping: matched?.requiresShipping || false,
        };
    }).sort((a, b) => b.rank - a.rank);

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

    const navigate = useNavigate();

    // 배송 정보 필요 여부 확인
    const needsShipping = sortedResults.some(
        (r) => r.requiresShipping === true
    );

    console.log('[디버그] sortedResults', sortedResults);

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
                    {needsShipping && (
                        <button className="btn-mint go-draw no-capture" onClick={() => setShowShippingModal(true)}>
                            배송 정보 입력하기
                        </button>
                    )}
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
                                {needsShipping && (
                                    <button className="btn-mint go-draw no-capture" onClick={() => setShowShippingModal(true)}>
                                        배송 정보 입력하기
                                    </button>
                                )}
                                <button className='btn-mint go-draw no-capture' onClick={onFinish}>확인 완료</button>
                                {sortedResults.some((r) => isHighRank(r)) && <ImageCaptureQR />}
                            </>
                        )}
                    </div>
                )
            )}
            {showShippingModal && (
                <ShippingFormModal
                    prizes={sortedResults}
                    onClose={() => setShowShippingModal(false)}
                />
            )}
        </div>
    );
}

export default ResultReveal;