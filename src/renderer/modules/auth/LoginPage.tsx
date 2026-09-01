import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, USER_ROLE_LABEL } from '@shared/constants/roles';
import { useSessionStore } from '@renderer/stores/session.store';
import './LoginPage.css';

export function LoginPage(): JSX.Element {
    const navigate = useNavigate();
    const loginAsRole = useSessionStore((state) => state.loginAsRole);

    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ARCHITECT);
    const [rememberSession, setRememberSession] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        loginAsRole(selectedRole);
        navigate('/dashboard');
    }

    return (
        <main className="login-page">
            <section className="login-intro" aria-label="Bienvenida a SIMBO">
                <div className="login-intro-content">
                    <div className="simbo-wordmark" aria-label="SIMBO">
                        <svg
                            className="simbo-logo-mark"
                            viewBox="0 0 120 120"
                            role="img"
                            aria-label="Logotipo SIMBO"
                        >
                            <circle cx="60" cy="60" r="49" />
                            <circle cx="60" cy="60" r="40" />
                            <circle cx="60" cy="60" r="31" />
                            <circle cx="60" cy="60" r="22" />
                            <circle cx="60" cy="60" r="13" />
                            <path d="M60 7c-18 0-33 9-42 23" />
                            <path d="M19 88c8 15 23 25 41 25" />
                            <path d="M100 87c-8 13-22 22-39 24" />
                            <path d="M60 22c-21 0-38 17-38 38 0 10 4 19 10 26" />
                            <path d="M60 37c-13 0-23 10-23 23 0 13 10 23 23 23" />
                        </svg>
                        <span className="simbo-wordmark-text">SIMBO</span>
                    </div>

                    <div className="login-welcome-copy">
                        <h1>Bienvenido al<br />inicio de sesión.</h1>
                        <p>
                            Ingresa todos tus datos para poder
                            <br />
                            tener acceso a SIMBO.
                        </p>
                    </div>
                </div>
            </section>

            <section className="login-panel" aria-labelledby="login-title">
                <div className="login-card">
                    <header className="login-card-header">
                        <h2 id="login-title">LogIn</h2>
                    </header>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field-group">
                            <label htmlFor="username">Usuario</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="miUsuario"
                                autoComplete="username"
                            />
                        </div>

                        <div className="login-field-group">
                            <label htmlFor="email">Correo electrónico</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="miCorreo"
                                autoComplete="email"
                            />
                        </div>

                        <div className="login-field-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="miContraseña"
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="login-options-row">
                            <label className="remember-session" htmlFor="remember-session">
                                <span>Recordar sesión</span>
                                <input
                                    id="remember-session"
                                    type="checkbox"
                                    checked={rememberSession}
                                    onChange={(event) => setRememberSession(event.target.checked)}
                                />
                                <span className="custom-checkbox" aria-hidden="true" />
                            </label>

                            <label className="role-selector" htmlFor="role">
                                <span>Rol de prueba</span>
                                <select
                                    id="role"
                                    value={selectedRole}
                                    onChange={(event) =>
                                        setSelectedRole(event.target.value as UserRole)
                                    }
                                >
                                    {Object.values(UserRole).map((role) => (
                                        <option key={role} value={role}>
                                            {USER_ROLE_LABEL[role]}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="login-actions">
                            <button type="submit" className="login-submit-button">
                                Iniciar sesión
                            </button>

                            <button type="button" className="forgot-password-button">
                                Olvidé mi contraseña
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
