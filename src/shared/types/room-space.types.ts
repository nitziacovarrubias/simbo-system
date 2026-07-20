export type RoomLayoutType = 'RECTANGULAR' | 'L_SHAPE' | 'U_SHAPE' | 'CUSTOM';

export type RoomOpeningType = 'DOOR' | 'WINDOW' | 'OTHER';

export interface RoomOpening {
  id?: string;
  name: string;
  type: RoomOpeningType;
  wall?: string;
  widthMm: number;
  heightMm?: number;
  positionMm: number;
}

export interface RoomSpace {
  layoutType: RoomLayoutType;
  widthMm: number;
  depthMm: number;
  heightMm: number;
  wallThicknessMm?: number | null;
  notes?: string;
  openings: RoomOpening[];
  createdAt: string;
  updatedAt: string;
}

export type RoomSpaceInput = Omit<RoomSpace, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};
