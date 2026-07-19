import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, USER_ROLE_LABEL } from '@shared/constants/roles';
import { useSessionStore } from '@renderer/stores/session.store';

export function LoginPage(): JSX.Element {
    const navigate = useNavigate();
    const loginAsRole = useSessionStore((state) => state.loginAsRole);
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ARCHITECT);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        loginAsRole(selectedRole);
        navigate('/dashboard');
    }

    return (
        <main className="login-page">
            <section className="login-card" aria-labelledby="login-title">
                <div className="login-brand">
                    <div className="brand-mark large" aria-hidden="true">
                        S
                    </div>
                    <div>
                        <p>BOIS Cocinas y Closets</p>
                        <h1 id="login-title">SIMBO</h1>
                    </div>
                </div>

                <p className="login-description">
                    Accede al sistema para gestionar proyectos, clientes, diseño, despiece y cronograma.
                </p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Correo</label>
                    <input id="email" type="email" value="demo@bois.local" readOnly />

                    <label htmlFor="password">Contraseña</label>
                    <input id="password" type="password" value="simbo-demo" readOnly />

                    <label htmlFor="role">Rol de prueba</label>
                    <select
                        id="role"
                        value={selectedRole}
                        onChange={(event) => setSelectedRole(event.target.value as UserRole)}
                    >
                        {Object.values(UserRole).map((role) => (
                            <option key={role} value={role}>
                                {USER_ROLE_LABEL[role]}
                            </option>
                        ))}
                    </select>

                    <button type="submit" className="primary-button">
                        Iniciar sesión
                    </button>
                </form>
            </section>
        </main>
    );
}