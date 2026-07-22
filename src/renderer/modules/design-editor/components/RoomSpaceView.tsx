import { useMemo } from 'react';
import { Shape } from 'three';
import type { RoomSpace } from '@shared/types';
import { millimetersToCanvasUnits } from '../utils/measure-conversion.utils';

interface RoomSpaceViewProps {
  roomSpace: RoomSpace;
}

interface WallSegment {
  x: number;
  z: number;
  length: number;
  angle: number;
}

function getPolygon(room: RoomSpace): Array<[number, number]> {
  const width = millimetersToCanvasUnits(room.widthMm);
  const depth = millimetersToCanvasUnits(room.depthMm);
  if (room.layoutType === 'L_SHAPE') {
    return [
      [-width / 2, -depth / 2],
      [width / 2, -depth / 2],
      [width / 2, 0],
      [0, 0],
      [0, depth / 2],
      [-width / 2, depth / 2]
    ];
  }
  if (room.layoutType === 'U_SHAPE') {
    return [
      [-width / 2, -depth / 2],
      [width / 2, -depth / 2],
      [width / 2, depth / 2],
      [width / 6, depth / 2],
      [width / 6, 0],
      [-width / 6, 0],
      [-width / 6, depth / 2],
      [-width / 2, depth / 2]
    ];
  }
  return [
    [-width / 2, -depth / 2],
    [width / 2, -depth / 2],
    [width / 2, depth / 2],
    [-width / 2, depth / 2]
  ];
}

export function RoomSpaceView({ roomSpace }: RoomSpaceViewProps): JSX.Element {
  const polygon = useMemo(() => getPolygon(roomSpace), [roomSpace]);
  const shape = useMemo(() => {
    const result = new Shape();
    const [first, ...rest] = polygon;
    if (first) result.moveTo(first[0], first[1]);
    rest.forEach(([x, z]) => result.lineTo(x, z));
    result.closePath();
    return result;
  }, [polygon]);

  const walls = useMemo<WallSegment[]>(() => {
    return polygon.map((point, index) => {
      const next = polygon[(index + 1) % polygon.length] ?? point;
      const dx = next[0] - point[0];
      const dz = next[1] - point[1];
      return {
        x: (point[0] + next[0]) / 2,
        z: (point[1] + next[1]) / 2,
        length: Math.hypot(dx, dz),
        angle: -Math.atan2(dz, dx)
      };
    });
  }, [polygon]);

  const wallHeight = millimetersToCanvasUnits(roomSpace.heightMm);
  const wallThickness = millimetersToCanvasUnits(roomSpace.wallThicknessMm ?? 100);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.015, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#E8EDF0" />
      </mesh>
      {walls.map((wall, index) => (
        <mesh
          key={`${wall.x}-${wall.z}-${index}`}
          position={[wall.x, wallHeight / 2, wall.z]}
          rotation={[0, wall.angle, 0]}
          receiveShadow
        >
          <boxGeometry args={[wall.length, wallHeight, wallThickness]} />
          <meshStandardMaterial color="#D8E0E4" transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  );
}
