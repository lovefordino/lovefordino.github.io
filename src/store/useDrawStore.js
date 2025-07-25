import {
    create
} from 'zustand';
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot
} from 'firebase/firestore';
import {
    db
} from '../firebase/firebaseConfig';
const docRef = doc(db, 'settings', 'prizes');
const PRIZE_DOC = doc(db, 'settings', 'prizes');

const useDrawStore = create((set, get) => ({
    prizes: [],
    displayMode: 'both',
    isLocked: false,
    isClosed: false,
    setClosed: (value) => set({
        isClosed: value
    }),

loadFromFirebase: async () => {
  const snap = await getDoc(PRIZE_DOC);
  if (snap.exists()) {
    const data = snap.data();
    const prizesWithDefaults = (data.prizes || []).map((p) => ({
      ...p,
      requiresShipping: p.requiresShipping ?? false,  // ✅ 있는 값 유지, 없으면만 false
    }));
    set({
      prizes: prizesWithDefaults,
      displayMode: data.displayMode || 'both',
      isLocked: data.isLocked || false,
      isClosed: data.isClosed || false,
    });
  }
},

listenToFirebase: () => {
  onSnapshot(PRIZE_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const prizesWithDefaults = (data.prizes || []).map((p) => ({
        ...p,
        requiresShipping: p.requiresShipping ?? false,  // ✅ 동일하게 적용
      }));
      set({
        prizes: prizesWithDefaults,
        displayMode: data.displayMode || 'both',
        isLocked: data.isLocked || false,
        isClosed: data.isClosed || false,
      });
    }
  });
},

    saveToFirebase: async () => {
        const {
            prizes,
            displayMode,
            isLocked,
            isClosed
        } = get(); // ← 여기에 포함!
        await setDoc(docRef, {
            prizes,
            displayMode,
            isLocked,
            isClosed,
        });
    },

    updatePrize: (index, updated) =>
        set((state) => {
            const newPrizes = [...state.prizes];
            newPrizes[index] = {
                ...newPrizes[index],
                ...updated
            };
            return {
                prizes: newPrizes
            };
        }),

    addPrize: () =>
        set((state) => {
            const nextRank = state.prizes.length + 1;
            if (nextRank > 10) return state;
            return {
                prizes: [
                    ...state.prizes,
                    {
                        rank: nextRank,
                        name: '',
                        quantity: 0,
                        remaining: 0,
                        requiresShipping: false,
                    },
                ],
            };
        }),

    deletePrize: (index) =>
        set((state) => {
            const updated = [...state.prizes];
            updated.splice(index, 1);
            updated.forEach((p, i) => (p.rank = i + 1));
            return { prizes: updated };
        }),

    setDisplayMode: (mode) => set({
        displayMode: mode
    }),
    setLocked: (locked) => set({
        isLocked: locked
    }),
}));

export default useDrawStore;