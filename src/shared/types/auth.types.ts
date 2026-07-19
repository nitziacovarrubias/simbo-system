import type { UserRole } from '@shared/constants/roles';

export interface AuthUser {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
}

export interface SessionSnapshot {
    user: AuthUser | null;
    isAuthenticated: boolean;
}