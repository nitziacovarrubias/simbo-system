import { create } from 'zustand';
import { UserRole } from '@shared/constants/roles';
import type { AuthUser } from '@shared/types/auth.types';

interface SessionStore {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loginAsRole: (role: UserRole) => void;
    logout: () => void;
}

const mockUsers: Record<UserRole, AuthUser> = {
    [UserRole.ARCHITECT]: {
        id: 'user_architect_demo',
        fullName: 'Carlos Arquitecto',
        email: 'arquitecto@bois.local',
        role: UserRole.ARCHITECT
    },
    [UserRole.SUPERVISOR]: {
        id: 'user_supervisor_demo',
        fullName: 'María Supervisora',
        email: 'supervisor@bois.local',
        role: UserRole.SUPERVISOR
    },
    [UserRole.COLLABORATOR]: {
        id: 'user_collaborator_demo',
        fullName: 'Ana Colaboradora',
        email: 'colaborador@bois.local',
        role: UserRole.COLLABORATOR
    },
    [UserRole.RESPONSIBLE]: {
        id: 'user_responsible_demo',
        fullName: 'Ramón Responsable',
        email: 'responsable@bois.local',
        role: UserRole.RESPONSIBLE
    }
};

export const useSessionStore = create<SessionStore>((set) => ({
    user: null,
    isAuthenticated: false,
    loginAsRole: (role) => {
        // Login temporal para probar navegación por roles.
        set({
            user: mockUsers[role],
            isAuthenticated: true
        });
    },
    logout: () => {
        set({
            user: null,
            isAuthenticated: false
        });
    }
}));