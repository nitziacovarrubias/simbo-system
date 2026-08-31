import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildRenderStoragePaths, isPathInside } from '@main/utils/render-paths';

describe('render storage paths', () => {
  it('keeps generated files under the controlled userData project directory', () => {
    const paths = buildRenderStoragePaths('/tmp/simbo-user-data', 'project_1', 'render_1');
    expect(paths.renderCadDirectory).toBe(path.join('/tmp/simbo-user-data', 'projects', 'project_1', 'cad', 'render_1'));
    expect(isPathInside('/tmp/simbo-user-data', paths.renderCadDirectory)).toBe(true);
  });

  it('rejects unsafe identifiers', () => {
    expect(() => buildRenderStoragePaths('/tmp/simbo', '../project', 'render_1')).toThrow('caracteres no permitidos');
  });
});
