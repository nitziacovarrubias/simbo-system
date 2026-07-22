import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Grid, OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import type { CameraCommand } from './EditorToolbar';
import { RoomSpaceView } from './RoomSpaceView';
import { DesignModuleMesh } from './DesignModuleMesh';
import { useEditorStore } from '@renderer/stores/editor.store';

interface CameraRigProps {
  command: CameraCommand;
  viewMode: '2D' | '3D';
}

function CameraRig({ command, viewMode }: CameraRigProps): JSX.Element {
  const { camera } = useThree();

  useEffect(() => {
    if (command.id === 0) return;
    if (command.type === 'zoom-in') camera.zoom *= 1.2;
    if (command.type === 'zoom-out') camera.zoom /= 1.2;
    if (command.type === 'reset') {
      camera.zoom = viewMode === '2D' ? 85 : 1;
      camera.position.set(
        viewMode === '2D' ? 0 : 4.8,
        viewMode === '2D' ? 10 : 4.2,
        viewMode === '2D' ? 0 : 5.2
      );
    }
    camera.updateProjectionMatrix();
  }, [camera, command, viewMode]);

  return <></>;
}

interface DesignCanvasProps {
  cameraCommand: CameraCommand;
}

export function DesignCanvas({ cameraCommand }: DesignCanvasProps): JSX.Element {
  const roomSpace = useEditorStore((state) => state.roomSpace);
  const modules = useEditorStore((state) => state.modules);
  const selectedModuleId = useEditorStore((state) => state.selectedModuleId);
  const selectModule = useEditorStore((state) => state.selectModule);
  const viewMode = useEditorStore((state) => state.viewMode);

  if (!roomSpace) return <div className="design-canvas-empty">No hay medidas del espacio.</div>;

  return (
    <div className="design-canvas" aria-label="Vista gráfica del espacio y módulos">
      <Canvas shadows onPointerMissed={() => selectModule(null)}>
        {viewMode === '2D' ? (
          <OrthographicCamera
            makeDefault
            position={[0, 10, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            zoom={85}
            near={0.1}
            far={100}
          />
        ) : (
          <PerspectiveCamera makeDefault position={[4.8, 4.2, 5.2]} fov={45} near={0.1} far={100} />
        )}
        <CameraRig command={cameraCommand} viewMode={viewMode} />
        <ambientLight intensity={1.35} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
        <Grid
          args={[20, 20]}
          cellSize={0.25}
          sectionSize={1}
          cellColor="#81949C"
          sectionColor="#3E5C76"
          fadeDistance={18}
          infiniteGrid
        />
        <RoomSpaceView roomSpace={roomSpace} />
        {modules.map((module) => (
          <DesignModuleMesh
            key={module.id}
            module={module}
            roomSpace={roomSpace}
            isSelected={selectedModuleId === module.id}
            onSelect={selectModule}
          />
        ))}
        <OrbitControls
          makeDefault
          enableRotate={viewMode === '3D'}
          maxPolarAngle={viewMode === '3D' ? Math.PI / 2.05 : 0}
          minPolarAngle={viewMode === '3D' ? 0.15 : 0}
          target={[0, 0.8, 0]}
        />
      </Canvas>
    </div>
  );
}
