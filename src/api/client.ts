const API_BASE = 'http://localhost:3001/api';

// Get token from localStorage
function getToken(): string | null {
    return localStorage.getItem('auth_token');
}

// Generic fetch wrapper with auth
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

// Auth API
export const authApi = {
    async register(email: string, password: string) {
        const result = await apiFetch<{ user: { id: number; email: string }; token: string }>(
            '/auth/register',
            { method: 'POST', body: JSON.stringify({ email, password }) }
        );
        localStorage.setItem('auth_token', result.token);
        return result;
    },

    async login(email: string, password: string) {
        const result = await apiFetch<{ user: { id: number; email: string }; token: string }>(
            '/auth/login',
            { method: 'POST', body: JSON.stringify({ email, password }) }
        );
        localStorage.setItem('auth_token', result.token);
        return result;
    },

    logout() {
        localStorage.removeItem('auth_token');
    },
};

// Exams API
export const examsApi = {
    async list() {
        return apiFetch<Array<{
            exam_id: string;
            name: string;
            papers: Array<{
                paper_id: string;
                label: string;
                year: number;
                type: string;
                duration_minutes: number;
                total_marks: number;
                total_questions: number;
            }>;
        }>>('/exams');
    },

    async get(paperId: string) {
        return apiFetch(`/exams/${paperId}`);
    },
};

// Attempts API
export const attemptsApi = {
    async start(paperId: string) {
        return apiFetch<{
            attemptId: number;
            paperId: string;
            startedAt: string;
            expectedEnd: string;
        }>('/attempts', { method: 'POST', body: JSON.stringify({ paperId }) });
    },

    async saveProgress(attemptId: number, answers: Record<string, unknown>, times: Record<string, number>) {
        return apiFetch(`/attempts/${attemptId}/progress`, {
            method: 'PATCH',
            body: JSON.stringify({ answers, times }),
        });
    },

    async submit(attemptId: number, answers: Record<string, unknown>, times: Record<string, number>, summary: unknown) {
        return apiFetch(`/attempts/${attemptId}/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers, times, summary }),
        });
    },

    async list() {
        return apiFetch<Array<{
            id: number;
            paperId: string;
            status: string;
            startedAt: string;
            endedAt?: string;
            finalScore?: number;
        }>>('/attempts');
    },

    async get(attemptId: number) {
        return apiFetch(`/attempts/${attemptId}`);
    },
};
