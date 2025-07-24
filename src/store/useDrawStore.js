import { create } from 'zustand';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const PRIZE_DOC = doc(db, 'settings', 'prizes');

const useDrawStore = create((set, get) => ({
    prizes: [],
    displayMode: 'both',
    isLocked: false,

    loadFromFirebase: async () => {
        const snap = await getDoc(PRIZE_DOC);
        if (snap.exists()) {
            const data = snap.data();
            set({
                prizes: data.prizes || [],
                displayMode: data.displayMode || 'both',
                isLocked: data.isLocked || false,
            });
        }
    },

    listenToFirebase: () => {
        onSnapshot(PRIZE_DOC, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                set({
                    prizes: data.prizes || [],
                    displayMode: data.displayMode || 'both',
                    isLocked: data.isLocked || false,
                });
            }
        });
    },

    saveToFirebase: async () => {
        const { prizes, displayMode, isLocked } = get();
        await setDoc(PRIZE_DOC, { prizes, displayMode, isLocked });
    },

    updatePrize: (index, updated) =>
        set((state) => {
            const newPrizes = [...state.prizes];
            newPrizes[index] = { ...newPrizes[index], ...updated };
            return { prizes: newPrizes };
        }),

    addPrize: () =>
        set((state) => {
            const nextRank = state.prizes.length + 1;
            if (nextRank > 10) return state;
            return {
                prizes: [
                    ...state.prizes,
                    { rank: nextRank, name: '', quantity: 0, remaining: 0 },
                ],
            };
        }),

    deletePrize: (index) =>
        set((state) => {
            const updated = [...state.prizes];
            updated.splice(index, 1);
            // 삭제 후 rank 재정렬
            updated.forEach((p, i) => (p.rank = i + 1));
            return { prizes: updated };
        }),

    setDisplayMode: (mode) => set({ displayMode: mode }),
    setLocked: (locked) => set({ isLocked: locked }),
}));

export default useDrawStore;