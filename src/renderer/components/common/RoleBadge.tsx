import { USER_ROLE_LABEL } from '@shared/constants/roles';
import type { UserRole } from '@shared/constants/roles';

interface RoleBadgeProps {
    role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps): JSX.Element {
    return <span className="role-badge">{USER_ROLE_LABEL[role]}</span>;
}