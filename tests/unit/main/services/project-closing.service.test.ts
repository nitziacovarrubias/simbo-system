import { describe, expect, it } from 'vitest';
import { UserRole } from '@shared/constants/roles';
import {
  validateProjectArchiving,
  validateProjectClosing
} from '@main/services/project-closing.service';

describe('project closing rules', () => {
  it('requires confirmation and a reason when activities remain open', () => {
    expect(() =>
      validateProjectClosing(2, {
        actorRole: UserRole.SUPERVISOR,
        confirmOpenActivities: false,
        reason: null
      })
    ).toThrow('actividades pendientes');

    expect(() =>
      validateProjectClosing(2, {
        actorRole: UserRole.SUPERVISOR,
        confirmOpenActivities: true,
        reason: 'Instalación terminada con pendiente administrativo.'
      })
    ).not.toThrow();
  });

  it('only allows archiving a closed project by a supervisor', () => {
    expect(() => validateProjectArchiving('CLOSED', UserRole.SUPERVISOR)).not.toThrow();
    expect(() => validateProjectArchiving('PRODUCTION', UserRole.SUPERVISOR)).toThrow();
    expect(() => validateProjectArchiving('CLOSED', UserRole.ARCHITECT)).toThrow();
  });
});
