import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@shared/constants/roles';

export interface AppRoute {
    path: string;
    title: string;
    description: string;
    Icon: LucideIcon;
    allowedRoles: UserRole[];
    moduleKey:
    | 'dashboard'
    | 'projects'
    | 'clients'
    | 'designEditor'
    | 'renders'
    | 'cuttingList'
    | 'quotations'
    | 'schedule'
    | 'alerts'
    | 'documents'
    | 'settings';
}