import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (userData, token) => {
                set({
                    user: userData,
                    token: token,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            updateUser: (userData) => {
                set({ user: { ...get().user, ...userData } });
            },

            setUser: (userData) => {
                set({ user: userData });
            },

            fetchUser: async () => {
                try {
                    const { default: api } = await import('../services/api');
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        set({ user: response.data.data });
                    }
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    // Optional: logout if 401? For now just log.
                }
            },
        }),
        {
            name: 'lapaknesa-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
