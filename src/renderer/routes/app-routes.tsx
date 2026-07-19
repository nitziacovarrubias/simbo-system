import {
    Bell,
    CalendarDays,
    ClipboardList,
    FileText,
    FolderKanban,
    LayoutDashboard,
    Ruler,
    Settings,
    Users,
    WalletCards
} from 'lucide-react';
import { UserRole } from '@shared/constants/roles';
import type { AppRoute } from '@shared/types/route.types';

const allRoles = [
    UserRole.ARCHITECT,
    UserRole.SUPERVISOR,
    UserRole.COLLABORATOR,
    UserRole.RESPONSIBLE
];

export const appRoutes: AppRoute[] = [
    {
        path: '/dashboard',
        title: 'Dashboard',
        description: 'Vista general de proyectos activos, avances, alertas y tareas recientes.',
        Icon: LayoutDashboard,
        allowedRoles: allRoles,
        moduleKey: 'dashboard'
    },
    {
        path: '/projects',
        title: 'Projects',
        description: 'Administración de proyectos, estado, ubicación, fechas y responsables.',
        Icon: FolderKanban,
        allowedRoles: [UserRole.ARCHITECT, UserRole.SUPERVISOR, UserRole.COLLABORATOR],
        moduleKey: 'projects'
    },
    {
        path: '/clients',
        title: 'Clients',
        description: 'Registro, búsqueda y consulta de clientes asociados a proyectos.',
        Icon: Users,
        allowedRoles: [UserRole.SUPERVISOR, UserRole.ARCHITECT],
        moduleKey: 'clients'
    },
    {
        path: '/design-editor',
        title: 'DesignEditor',
        description: 'Editor inicial preparado para bosquejo 2D, módulos y futura vista 3D.',
        Icon: Ruler,
        allowedRoles: [UserRole.ARCHITECT, UserRole.COLLABORATOR],
        moduleKey: 'designEditor'
    },
    {
        path: '/cutting-list',
        title: 'CuttingList',
        description: 'Módulo futuro para generar, revisar, autorizar y exportar despieces.',
        Icon: ClipboardList,
        allowedRoles: [UserRole.SUPERVISOR, UserRole.ARCHITECT],
        moduleKey: 'cuttingList'
    },
    {
        path: '/quotations',
        title: 'Quotations',
        description: 'Módulo futuro para cotizaciones, costos, IVA, anticipos y totales.',
        Icon: WalletCards,
        allowedRoles: [UserRole.SUPERVISOR],
        moduleKey: 'quotations'
    },
    {
        path: '/schedule',
        title: 'Schedule',
        description: 'Cronograma de actividades, fechas límite y responsables por etapa.',
        Icon: CalendarDays,
        allowedRoles: [UserRole.SUPERVISOR, UserRole.ARCHITECT, UserRole.RESPONSIBLE],
        moduleKey: 'schedule'
    },
    {
        path: '/alerts',
        title: 'Alerts',
        description: 'Alertas por retrasos, incidencias, fechas próximas y prioridades.',
        Icon: Bell,
        allowedRoles: allRoles,
        moduleKey: 'alerts'
    },
    {
        path: '/documents',
        title: 'Documents',
        description: 'Documentos del proyecto por etapa, historial y archivos de soporte.',
        Icon: FileText,
        allowedRoles: allRoles,
        moduleKey: 'documents'
    },
    {
        path: '/settings',
        title: 'Settings',
        description: 'Preferencias del sistema, roles, seguridad y configuración futura.',
        Icon: Settings,
        allowedRoles: [UserRole.SUPERVISOR, UserRole.ARCHITECT],
        moduleKey: 'settings'
    }
];