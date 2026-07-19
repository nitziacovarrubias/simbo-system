export enum UserRole {
    ARCHITECT = 'ARCHITECT',
    SUPERVISOR = 'SUPERVISOR',
    COLLABORATOR = 'COLLABORATOR',
    RESPONSIBLE = 'RESPONSIBLE'
}

export const USER_ROLE_LABEL: Record<UserRole, string> = {
    [UserRole.ARCHITECT]: 'Arquitecto',
    [UserRole.SUPERVISOR]: 'Supervisor',
    [UserRole.COLLABORATOR]: 'Colaborador',
    [UserRole.RESPONSIBLE]: 'Responsable'
};

export const MAIN_ACCESS_ROLES: UserRole[] = [
    UserRole.ARCHITECT,
    UserRole.SUPERVISOR,
    UserRole.COLLABORATOR,
    UserRole.RESPONSIBLE
];