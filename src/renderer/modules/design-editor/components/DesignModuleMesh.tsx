import type { ThreeEvent } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import type { DesignModuleMutationInput, RoomSpace } from '@shared/types';
import { millimetersToCanvasUnits } from '../utils/measure-conversion.utils';

interface DesignModuleMeshProps {
  module: DesignModuleMutationInput;
  roomSpace: RoomSpace;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function DesignModuleMesh({
  module,
  roomSpace,
  isSelected,
  onSelect
}: DesignModuleMeshProps): JSX.Element {
  const width = millimetersToCanvasUnits(module.widthMm);
  const height = millimetersToCanvasUnits(module.heightMm);
  const depth = millimetersToCanvasUnits(module.depthMm);
  const x = millimetersToCanvasUnits(module.positionX - roomSpace.widthMm / 2);
  const y = millimetersToCanvasUnits(module.positionY) + height / 2;
  const z = millimetersToCanvasUnits(module.positionZ - roomSpace.depthMm / 2);

  const select = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    onSelect(module.id);
  };

  return (
    <mesh
      position={[x, y, z]}
      rotation={[0, (module.rotationY * Math.PI) / 180, 0]}
      castShadow
      receiveShadow
      onClick={select}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={module.hasCollision ? '#D64545' : module.colorHex} />
      <Edges
        color={module.hasCollision ? '#9B111E' : isSelected ? '#D97D54' : '#293241'}
        lineWidth={isSelected ? 3 : 1}
      />
      {isSelected ? (
        <Html center position={[0, height / 2 + 0.12, 0]} distanceFactor={8}>
          <span className="module-canvas-label">{module.displayName}</span>
        </Html>
      ) : null}
    </mesh>
  );
}
