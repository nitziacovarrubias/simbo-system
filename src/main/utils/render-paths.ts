import path from 'node:path';

const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function assertSafeStorageId(value: string, label: string): string {
  if (!SAFE_ID_PATTERN.test(value)) {
    throw new Error(`${label} contiene caracteres no permitidos para almacenamiento.`);
  }
  return value;
}

export interface ProjectStoragePaths {
  projectRoot: string;
  rendersDirectory: string;
  cadDirectory: string;
  tempDirectory: string;
}

export function buildProjectStoragePaths(userDataPath: string, projectId: string): ProjectStoragePaths {
  const safeProjectId = assertSafeStorageId(projectId, 'El ID del proyecto');
  const projectRoot = path.join(userDataPath, 'projects', safeProjectId);
  return {
    projectRoot,
    rendersDirectory: path.join(projectRoot, 'renders'),
    cadDirectory: path.join(projectRoot, 'cad'),
    tempDirectory: path.join(projectRoot, 'temp')
  };
}

export function buildRenderStoragePaths(
  userDataPath: string,
  projectId: string,
  renderId: string
): ProjectStoragePaths & { renderCadDirectory: string; renderTempDirectory: string } {
  const paths = buildProjectStoragePaths(userDataPath, projectId);
  const safeRenderId = assertSafeStorageId(renderId, 'El ID del render');
  return {
    ...paths,
    renderCadDirectory: path.join(paths.cadDirectory, safeRenderId),
    renderTempDirectory: path.join(paths.tempDirectory, safeRenderId)
  };
}

export function isPathInside(parentPath: string, childPath: string): boolean {
  const relative = path.relative(path.resolve(parentPath), path.resolve(childPath));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}
