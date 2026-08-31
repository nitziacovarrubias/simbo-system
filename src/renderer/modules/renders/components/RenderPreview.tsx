import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { PerspectiveCamera as ThreePerspectiveCamera, Vector2 } from 'three';
import type { DesignDocument, RenderImageFormat, RenderQuality, RenderViewType } from '@shared/types';
import { RoomSpaceView } from '@renderer/modules/design-editor/components/RoomSpaceView';
import { DesignModuleMesh } from '@renderer/modules/design-editor/components/DesignModuleMesh';

export interface RenderCaptureOptions {
  width: number;
  height: number;
  imageFormat: RenderImageFormat;
  quality: RenderQuality;
}

export interface RenderPreviewHandle {
  capture: (options: RenderCaptureOptions) => Promise<string>;
}

interface RenderPreviewProps {
  design: DesignDocument;
  viewType: RenderViewType;
  quality: RenderQuality;
}

type CaptureFunction = (options: RenderCaptureOptions) => Promise<string>;

function applyCameraView(camera: ThreePerspectiveCamera, viewType: RenderViewType): void {
  if (viewType === 'CUSTOM') return;
  if (viewType === 'FRONT') camera.position.set(0, 1.8, 6.6);
  else if (viewType === 'TOP') camera.position.set(0.01, 8, 0.01);
  else camera.position.set(5.4, 4.5, 5.8);
  camera.lookAt(0, 1, 0);
  camera.updateProjectionMatrix();
}

function CameraPreset({ viewType }: { viewType: RenderViewType }): JSX.Element {
  const camera = useThree((state) => state.camera as ThreePerspectiveCamera);
  useEffect(() => applyCameraView(camera, viewType), [camera, viewType]);
  return <></>;
}

function CaptureBridge({ onReady }: { onReady: (capture: CaptureFunction) => void }): JSX.Element {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera as ThreePerspectiveCamera);

  useEffect(() => {
    const capture: CaptureFunction = async ({ width, height, imageFormat, quality }) => {
      const originalSize = gl.getSize(new Vector2());
      const originalPixelRatio = gl.getPixelRatio();
      const originalAspect = camera.aspect;
      try {
        gl.setPixelRatio(1);
        gl.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        gl.render(scene, camera);
        const mime = imageFormat === 'PNG' ? 'image/png' : 'image/jpeg';
        const jpegQuality = quality === 'LOW' ? 0.72 : quality === 'MEDIUM' ? 0.84 : quality === 'HIGH' ? 0.93 : 0.98;
        return gl.domElement.toDataURL(mime, jpegQuality);
      } finally {
        gl.setPixelRatio(originalPixelRatio);
        gl.setSize(originalSize.x, originalSize.y, false);
        camera.aspect = originalAspect;
        camera.updateProjectionMatrix();
        gl.render(scene, camera);
      }
    };
    onReady(capture);
  }, [camera, gl, onReady, scene]);

  return <></>;
}

export const RenderPreview = forwardRef<RenderPreviewHandle, RenderPreviewProps>(function RenderPreview(
  { design, viewType, quality },
  ref
): JSX.Element {
  const captureFunctionRef = useRef<CaptureFunction | null>(null);

  useImperativeHandle(ref, () => ({
    capture: async (options) => {
      if (!captureFunctionRef.current) {
        throw new Error('La vista 3D todavía no está lista para capturarse.');
      }
      return captureFunctionRef.current(options);
    }
  }), []);

  return (
    <div className="render-preview" aria-label="Vista previa del render">
      <Canvas shadows gl={{ preserveDrawingBuffer: true, antialias: quality !== 'LOW' }}>
        <color attach="background" args={['#eef2f3']} />
        <PerspectiveCamera makeDefault position={[5.4, 4.5, 5.8]} fov={45} near={0.1} far={100} />
        <CameraPreset viewType={viewType} />
        <ambientLight intensity={quality === 'LOW' ? 1.2 : 1.45} />
        <directionalLight position={[5, 8, 5]} intensity={1.65} castShadow={quality !== 'LOW'} />
        <directionalLight position={[-4, 5, -3]} intensity={0.45} />
        <RoomSpaceView roomSpace={design.roomSpace} />
        {design.modules.map((module) => (
          <DesignModuleMesh
            key={module.id}
            module={module}
            roomSpace={design.roomSpace}
            isSelected={false}
            onSelect={() => undefined}
          />
        ))}
        <OrbitControls
          makeDefault
          enabled={viewType === 'CUSTOM'}
          enablePan={viewType === 'CUSTOM'}
          enableZoom
          target={[0, 1, 0]}
          maxPolarAngle={Math.PI / 2.02}
        />
        <CaptureBridge onReady={(capture) => { captureFunctionRef.current = capture; }} />
      </Canvas>
    </div>
  );
});
