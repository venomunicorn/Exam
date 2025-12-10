import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

function LoginPage() {
    const navigate = useNavigate();
    const { login, register, isLoading, error, clearError } = useAuthStore();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            if (isRegister) {
                await register(email, password);
            } else {
                await login(email, password);
            }
            navigate('/');
        } catch {
            // Error is already set in store
        }
    };

    return (
        <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
        }}>
            <div className="card animate-slide-up" style={{
                maxWidth: '400px',
                width: '100%',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
                    <h1 style={{
                        fontSize: 'var(--font-size-2xl)',
                        marginBottom: 'var(--spacing-2)',
                        background: 'var(--color-accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        GATE TestPrep
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        {isRegister ? 'Create your account' : 'Sign in to continue'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 'var(--spacing-2)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-6)' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 'var(--spacing-2)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'var(--color-error-bg)',
                            border: '1px solid var(--color-error)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-3)',
                            marginBottom: 'var(--spacing-4)',
                            color: 'var(--color-error)',
                            fontSize: 'var(--font-size-sm)',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: 'var(--spacing-4)' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <button
                        className="btn btn-ghost"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            clearError();
                        }}
                    >
                        {isRegister
                            ? 'Already have an account? Sign in'
                            : "Don't have an account? Register"}
                    </button>
                </div>

                {/* Skip login option for local use */}
                <div style={{
                    marginTop: 'var(--spacing-6)',
                    paddingTop: 'var(--spacing-4)',
                    borderTop: '1px solid var(--color-border)',
                    textAlign: 'center',
                }}>
                    <button
                        className="btn btn-ghost"
                        onClick={() => navigate('/')}
                        style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}
                    >
                        Continue without account →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
