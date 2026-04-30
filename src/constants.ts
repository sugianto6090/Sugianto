export const COLS = 10;
export const ROWS = 20;
export const INITIAL_DROP_SPEED = 800;
export const MIN_DROP_SPEED = 100;
export const SPEED_INCREMENT = 15; // Speed increases by this much each level

export type Shape = (number | string)[][];

export interface Tetromino {
  shape: Shape;
  color: string;
  icon: string;
  id: string;
}

export const TETROMINOS: Record<string, Tetromino> = {
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
    ],
    color: 'bg-cyan-400',
    icon: '🦁',
    id: 'I'
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0],
    ],
    color: 'bg-blue-500',
    icon: '🐘',
    id: 'J'
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L'],
    ],
    color: 'bg-orange-500',
    icon: '🦓',
    id: 'L'
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O'],
    ],
    color: 'bg-yellow-400',
    icon: '🦒',
    id: 'O'
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0],
    ],
    color: 'bg-green-500',
    icon: '🦊',
    id: 'S'
  },
  T: {
    shape: [
      [0, 'T', 0],
      ['T', 'T', 'T'],
      [0, 0, 0],
    ],
    color: 'bg-purple-500',
    icon: '🐻',
    id: 'T'
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0],
    ],
    color: 'bg-red-500',
    icon: '🐼',
    id: 'Z'
  },
};

export const randomTetromino = () => {
  const keys = Object.keys(TETROMINOS);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOS[randKey];
};
