
export enum UserRole {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  projectsCount: number;
}

export type Point = { x: number; y: number };

export type NodeType = 'corner' | 'smooth' | 'symmetric' | 'auto';

export interface PathNode {
  id: string;
  pos: Point;
  handleIn?: Point;
  handleOut?: Point;
  type: NodeType;
  isTechnical?: boolean;
}

export type ToolType = 
  | 'select' | 'node' | 'pencil' | 'bezier' | 'rect' | 'circle' 
  | 'star' | 'spiral' | 'text' | 'eraser' | 'bucket' | 'dropper' 
  | 'measure' | 'compass' | 'zoom' | 'pan' | 'mirror';

export type SymmetryType = 'none' | 'vertical' | 'horizontal' | 'quad';

export interface Measurements {
  bust: number;
  waist: number;
  hip: number;
  shoulderWidth: number;
  backLength: number;
  armLength: number;
  inseam: number;
  neckCirc: number;
  skirtLength: number;
  rise: number;
  ease: number;
  seamAllowance: number;
}

export interface VectorElement {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'star' | 'spiral' | 'pencil' | 'technical' | 'text';
  nodes: PathNode[];
  closed: boolean;
  
  // Primitives specific
  sides?: number; 
  ratio?: number; 
  turns?: number; 
  textContent?: string;
  
  // Style
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDashArray?: string;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  
  // Transform
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  
  // Metadata
  name: string;
  locked: boolean;
  visible: boolean;
  layerId: string;
  mirrorAxis?: 'none' | 'vertical' | 'horizontal';
}

export interface AIPatternResponse {
  patternPieces: {
    name: string;
    description: string;
    dimensions: string;
  }[];
  instructions: string[];
  fabricSuggestions: string;
  estimatedYardage: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}
