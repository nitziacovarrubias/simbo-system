import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/shared/constants/roles';
import { appRoutes } from '../../src/renderer/routes/app-routes';

describe('appRoutes', () => {
    it('defines the required initial SIMBO screens', () => {
        const paths = appRoutes.map((route) => route.path);

        expect(paths).toContain('/dashboard');
        expect(paths).toContain('/projects');
        expect(paths).toContain('/clients');
        expect(paths).toContain('/design-editor');
        expect(paths).toContain('/cutting-list');
        expect(paths).toContain('/quotations');
        expect(paths).toContain('/schedule');
        expect(paths).toContain('/alerts');
        expect(paths).toContain('/documents');
        expect(paths).toContain('/settings');
    });

    it('prepares restricted access for supervisor modules', () => {
        const quotationsRoute = appRoutes.find((route) => route.path === '/quotations');

        expect(quotationsRoute?.allowedRoles).toContain(UserRole.SUPERVISOR);
        expect(quotationsRoute?.allowedRoles).not.toContain(UserRole.COLLABORATOR);
    });
});