import { create } from 'zustand';

const useAuthStore = create((set) => ({
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    login: (password) => {
        if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
            localStorage.setItem('isAdmin', 'true');
            set({ isAdmin: true });
            return true;
        }
        return false;
    },
    logout: () => {
        localStorage.removeItem('isAdmin');
        set({ isAdmin: false });
    },
}));

export default useAuthStore;
