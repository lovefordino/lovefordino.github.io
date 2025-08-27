import { create } from 'zustand';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const PRIZE_DOC = doc(db, 'settings', 'prizes');
const MAX_PRIZES = 50;

const useDrawStore = create((set, get) => ({
  prizes: [],
  displayMode: 'both',
  isLocked: false,
  isClosed: false,
  noticeMessage: '',

  setClosed: (value) => set({ isClosed: value }),
  setLocked: (locked) => set({ isLocked: locked }),
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setNoticeMessage: (msg) => set({ noticeMessage: msg }),

  loadFromFirebase: async () => {
    const snap = await getDoc(PRIZE_DOC);
    if (snap.exists()) {
      const data = snap.data();
      const prizesWithDefaults = (data.prizes || []).map(p => ({
        ...p,
        requiresShipping: p.requiresShipping ?? false,
      }));

      set({
        prizes: prizesWithDefaults.slice(0, MAX_PRIZES),
        displayMode: data.displayMode || 'both',
        isLocked: data.isLocked || false,
        isClosed: data.isClosed || false,
        noticeMessage: data.noticeMessage || '',
      });
    }
  },

  listenToFirebase: () => {
    onSnapshot(PRIZE_DOC, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const prizesWithDefaults = (data.prizes || []).map(p => ({
          ...p,
          requiresShipping: p.requiresShipping ?? false,
        }));

        set({
          prizes: prizesWithDefaults.slice(0, MAX_PRIZES),
          displayMode: data.displayMode || 'both',
          isLocked: data.isLocked || false,
          isClosed: data.isClosed || false,
          noticeMessage: data.noticeMessage || '',
        });
      }
    });
  },

  saveToFirebase: async () => {
    const { prizes, displayMode, isLocked, isClosed, noticeMessage } = get();
    await setDoc(PRIZE_DOC, {
      prizes: prizes.slice(0, MAX_PRIZES),
      displayMode,
      isLocked,
      isClosed,
      noticeMessage,
    });
  },

  updatePrize: (index, updated) =>
    set((state) => {
      const newPrizes = [...state.prizes];
      newPrizes[index] = { ...newPrizes[index], ...updated };
      return { prizes: newPrizes };
    }),

  addPrize: () =>
    set((state) => {
      if (state.prizes.length >= MAX_PRIZES) return state; // <= 50개 제한
      const nextRank = state.prizes.length + 1;
      return {
        prizes: [
          ...state.prizes,
          { rank: nextRank, name: '', quantity: 0, remaining: 0, requiresShipping: false },
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

  // 선택: UI에서 버튼 disable 등에 쓰고 싶다면
  canAddPrize: () => get().prizes.length < MAX_PRIZES,
}));

export default useDrawStore;
