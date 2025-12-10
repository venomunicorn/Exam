import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/client';

interface User {
    id: number;
    email: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await authApi.login(email, password);
                    set({
                        user: result.user,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Login failed',
                        isLoading: false
                    });
                    throw err;
                }
            },

            register: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await authApi.register(email, password);
                    set({
                        user: result.user,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Registration failed',
                        isLoading: false
                    });
                    throw err;
                }
            },

            logout: () => {
                authApi.logout();
                set({ user: null, isAuthenticated: false });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
