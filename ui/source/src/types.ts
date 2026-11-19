export interface Coords {
  x: number;
  y: number;
  z: number;
}

export interface Blip {
  id: number;
  name: string;
  sprite: number;
  color: number;
  scale: number;
  shortRange: boolean;
  coords?: Coords;
}

export type BlipDraft = Omit<Blip, 'id' | 'coords'> & { id?: number };

export interface Sprite {
  id: number;
  name: string;
}

export interface SpriteCategory {
  name: string;
  sprites: Sprite[];
}

export interface BlipColor {
  id: number;
  name: string;
}

export type NuiMessage =
  | {
      action: 'openMenu';
      blips: Blip[];
      commonColors: BlipColor[];
      spriteCategories: SpriteCategory[];
      defaults?: Partial<BlipDraft>;
    }
  | { action: 'updateBlips'; blips: Blip[] }
  | { action: 'closeMenu' };
