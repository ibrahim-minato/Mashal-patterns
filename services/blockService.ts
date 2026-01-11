
import { Measurements, VectorElement, PathNode, Point } from '../types';

const createNode = (p: Point, type: 'corner' | 'smooth' = 'corner'): PathNode => ({
  id: Math.random().toString(36).substr(2, 9),
  pos: p,
  type
});

const getBaseElement = (id: string, name: string): Partial<VectorElement> => ({
  id: id + '_' + Date.now(),
  name,
  x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1,
  opacity: 1,
  blendMode: 'source-over',
  locked: false, visible: true, layerId: 'layer1'
});

export const generatePatternPiece = (
  nodes: PathNode[], 
  name: string, 
  fill: string = 'rgba(79, 70, 229, 0.05)', 
  stroke: string = '#4f46e5',
  closed: boolean = true
): VectorElement => ({
  ...getBaseElement('piece', name),
  type: 'path',
  nodes,
  closed,
  fill,
  stroke,
  strokeWidth: 2,
} as VectorElement);

/**
 * Technical Marking: Grainline
 */
export const createGrainline = (x: number, y: number, length: number): VectorElement => ({
  ...getBaseElement('grain', 'Grainline'),
  type: 'technical',
  nodes: [createNode({ x, y }), createNode({ x, y: y + length })],
  closed: false,
  fill: 'none',
  stroke: '#6366f1',
  strokeWidth: 1,
  strokeDashArray: '10,5'
} as VectorElement);

/**
 * WOMEN'S BASIC BLOCKS
 */
export const generateWomenBodice = (m: Measurements): VectorElement[] => {
  const elements: VectorElement[] = [];
  const bQ = (m.bust / 4) + m.ease / 4;
  const wQ = (m.waist / 4) + 1.5; // with dart allowance
  const neckW = 3;
  const neckD = 3.5;
  const sSlope = 1.5;

  // Front Piece
  const frontNodes = [
    createNode({ x: 0, y: neckD }), // CF Neck
    createNode({ x: neckW, y: 0 }), // HPS
    createNode({ x: m.shoulderWidth, y: sSlope }), // Shoulder point
    createNode({ x: bQ, y: 8 }), // Armhole bottom
    createNode({ x: wQ, y: m.backLength }), // Waist side
    createNode({ x: 0, y: m.backLength }), // CF Waist
  ];
  elements.push(generatePatternPiece(frontNodes, 'Bodice Front'));
  elements.push(createGrainline(bQ / 2, 10, m.backLength - 20));

  return elements;
};

export const generateWomenSkirt = (m: Measurements): VectorElement[] => {
  const elements: VectorElement[] = [];
  const wQ = (m.waist / 4) + 1.25;
  const hQ = (m.hip / 4) + m.ease / 8;
  const hD = 8;

  const nodes = [
    createNode({ x: 0, y: 0 }),
    createNode({ x: wQ, y: -0.5 }),
    createNode({ x: hQ, y: hD }),
    createNode({ x: hQ, y: m.skirtLength }),
    createNode({ x: 0, y: m.skirtLength }),
  ];
  elements.push(generatePatternPiece(nodes, 'Skirt Front'));
  elements.push(createGrainline(hQ / 2, 10, m.skirtLength - 20));
  return elements;
};

export const generatePantsBlock = (m: Measurements, isMens: boolean = false): VectorElement[] => {
  const elements: VectorElement[] = [];
  const hQ = (m.hip / 4) + (isMens ? 1 : 0.5);
  const crotchOut = hQ / 3;
  
  const nodes = [
    createNode({ x: 0, y: 0 }), // Center Front Waist
    createNode({ x: hQ, y: 0 }), // Side Waist
    createNode({ x: hQ + 0.5, y: m.rise }), // Side Hip
    createNode({ x: hQ, y: m.rise + m.inseam }), // Hem Side
    createNode({ x: 0, y: m.rise + m.inseam }), // Hem Inseam
    createNode({ x: -crotchOut, y: m.rise }), // Crotch Point
  ];
  elements.push(generatePatternPiece(nodes, isMens ? 'Mens Trouser' : 'Womens Pants'));
  return elements;
};

/**
 * MEN'S BASIC BLOCKS
 */
export const generateMensShirt = (m: Measurements): VectorElement[] => {
  const elements: VectorElement[] = [];
  const bQ = (m.bust / 4) + 2; // Extra ease for shirt
  const wQ = (m.waist / 4) + 1.5;
  const hQ = (m.hip / 4) + 1.5;
  const neckW = 3.2;
  const neckD = 3.5;
  const sSlope = 1.75;
  
  // Shirt Front
  const frontNodes = [
    createNode({ x: 0, y: neckD }), // CF Neck
    createNode({ x: neckW, y: 0 }), // HPS
    createNode({ x: m.shoulderWidth + 0.5, y: sSlope }), // Shoulder point
    createNode({ x: bQ, y: 10 }), // Armhole bottom
    createNode({ x: wQ, y: 18 }), // Waist
    createNode({ x: hQ, y: 28 }), // Hip/Hem side
    createNode({ x: 0, y: 28 }), // CF Hem
  ];
  elements.push(generatePatternPiece(frontNodes, 'Mens Shirt Front'));
  elements.push(createGrainline(bQ / 2, 5, 20));
  
  return elements;
};

/**
 * CHILDREN'S BASIC BLOCKS (Ages 2-16)
 */
export const generateChildBodice = (m: Measurements): VectorElement[] => {
  const elements: VectorElement[] = [];
  const bQ = (m.bust / 4) + 1; // Basic ease for children
  const wQ = (m.waist / 4) + 1;
  const neckW = 2.5;
  const neckD = 2.5;
  const sSlope = 1;
  
  const nodes = [
    createNode({ x: 0, y: neckD }), // CF Neck
    createNode({ x: neckW, y: 0 }), // HPS
    createNode({ x: m.shoulderWidth, y: sSlope }), // Shoulder
    createNode({ x: bQ, y: 6 }), // Armhole bottom
    createNode({ x: wQ, y: m.backLength }), // Waist
    createNode({ x: 0, y: m.backLength }), // CF Waist
  ];
  elements.push(generatePatternPiece(nodes, 'Child Bodice Front'));
  elements.push(createGrainline(bQ / 2, 2, m.backLength - 4));
  
  return elements;
};

/**
 * FRENCH CURVE LIBRARY
 */
export const generateFrenchCurve = (type: 'hip' | 'armhole' | 'neckline' | 'crotch'): VectorElement[] => {
  const elements: VectorElement[] = [];
  let nodes: PathNode[] = [];
  let name = '';

  if (type === 'hip') {
    name = 'Hip Curve';
    nodes = [
      createNode({ x: 0, y: 0 }, 'smooth'),
      createNode({ x: 2, y: 8 }, 'smooth'),
      createNode({ x: 5, y: 24 }, 'smooth'),
    ];
  } else if (type === 'armhole') {
    name = 'Armhole Curve';
    nodes = [
      createNode({ x: 0, y: 0 }, 'smooth'),
      createNode({ x: 3, y: 4 }, 'smooth'),
      createNode({ x: 8, y: 6 }, 'smooth'),
    ];
  } else if (type === 'neckline') {
    name = 'Neckline Curve';
    nodes = [
      createNode({ x: 0, y: 0 }, 'smooth'),
      createNode({ x: 4, y: 3 }, 'smooth'),
      createNode({ x: 8, y: 0 }, 'smooth'),
    ];
  } else if (type === 'crotch') {
    name = 'Crotch Curve';
    nodes = [
      createNode({ x: 0, y: 0 }, 'smooth'),
      createNode({ x: 2, y: 5 }, 'smooth'),
      createNode({ x: 8, y: 8 }, 'smooth'),
    ];
  }

  elements.push(generatePatternPiece(nodes, name, 'none', '#6366f1', false));
  return elements;
};
