
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  User, ToolType, VectorElement, Viewport, Measurements, PathNode, Point, SymmetryType, UserRole
} from '../types';
import { downloadPatternPDF } from '../services/pdfService';
import { generatePatternGuidance } from '../services/geminiService';
import * as Blocks from '../services/blockService';
import { 
  Scissors, MousePointer2, Sparkles, Eraser, 
  Undo2, Redo2, PaintBucket, LayoutGrid, CircleDot, 
  Compass, Layers, Sliders, Hash, PenTool, Pencil, 
  Eye, ChevronRight, Maximize2, Search, ZoomIn, 
  Grab, Contrast, Wind, FileOutput, Library, Calculator,
  Square, Shirt, Baby, User as UserIcon, Box, Star, 
  Type, Pipette, Ruler, Move, MousePointer, Spline,
  RefreshCw, Hand, FlipHorizontal, Trash2, Grid3X3, Zap, RotateCw,
  Columns, Rows, Grid2X2, Camera, Wand2, Info,
  Pentagon, Boxes, SprayCan, Brush, Pipette as Eyedropper, 
  Triangle, Palette, MousePointerSquareDashed
} from 'lucide-react';

interface WorkspaceProps {
  user: User;
}

type TransformHandle = 'tl' | 'tr' | 'bl' | 'br' | 'rotate' | 'none';

interface TransformState {
  initialElements: VectorElement[];
  initialBounds: { x: number; y: number; w: number; h: number; cx: number; cy: number };
  initialMouse: Point;
  handle: TransformHandle;
}

interface NodeDragState {
  elementId: string;
  nodeId: string;
}

const Workspace: React.FC<WorkspaceProps> = ({ user }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [blockCategory, setBlockCategory] = useState<'women' | 'men' | 'children' | 'unisex'>('women');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [shapeAssist, setShapeAssist] = useState(true);
  const [symmetryMode, setSymmetryMode] = useState<SymmetryType>('none');
  
  const [elements, setElements] = useState<VectorElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 300, y: 200, zoom: 0.8 });
  const [activeSidebarTab, setActiveSidebarTab] = useState<'measurements' | 'blocks' | 'ai' | 'properties'>('measurements');

  useEffect(() => {
    if (selectedIds.length > 0) {
      setActiveSidebarTab('properties');
    }
  }, [selectedIds]);
  
  // History State
  const [history, setHistory] = useState<VectorElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Selection/Transform states
  const [selectionMarquee, setSelectionMarquee] = useState<{ start: Point, end: Point } | null>(null);
  const [activeHandle, setActiveHandle] = useState<TransformHandle>('none');
  const transformState = useRef<TransformState | null>(null);
  const nodeDragState = useRef<NodeDragState | null>(null);

  // Drawing states
  const [pencilPoints, setPencilPoints] = useState<Point[]>([]);
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 });
  
  // Style Options
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#6366f1');
  const [fillColor, setFillColor] = useState('rgba(99, 102, 241, 0.1)');

  const [measurements, setMeasurements] = useState<Measurements>({
    bust: 34, waist: 26, hip: 36, shoulderWidth: 5, backLength: 16, 
    armLength: 22, inseam: 29, neckCirc: 13, skirtLength: 24, rise: 10.5,
    ease: 2, seamAllowance: 0.5
  });

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isPanning = useRef(false);
  const dragStartWorld = useRef<Point>({ x: 0, y: 0 });
  const panStartScreen = useRef<Point>({ x: 0, y: 0 });

  // --- History Management ---
  const saveHistory = useCallback((newElements: VectorElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setElements(JSON.parse(JSON.stringify(history[prevIndex])));
      setSelectedIds([]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(JSON.parse(JSON.stringify(history[nextIndex])));
      setSelectedIds([]);
    }
  };

  // --- Coordinate Mapping ---
  const screenToWorld = useCallback((p: Point): Point => ({
    x: (p.x - viewport.x) / viewport.zoom,
    y: (p.y - viewport.y) / viewport.zoom
  }), [viewport]);

  const snap = (p: Point): Point => {
    if (!snapToGrid) return p;
    const gridSize = 20;
    return {
      x: Math.round(p.x / gridSize) * gridSize,
      y: Math.round(p.y / gridSize) * gridSize
    };
  };

  const getElementBounds = (el: VectorElement) => {
    const xs = el.nodes.map(n => n.pos.x * el.scaleX + el.x);
    const ys = el.nodes.map(n => n.pos.y * el.scaleY + el.y);
    return { 
      minX: Math.min(...xs), maxX: Math.max(...xs), 
      minY: Math.min(...ys), maxY: Math.max(...ys) 
    };
  };

  const selectionBounds = useMemo(() => {
    if (selectedIds.length === 0) return null;
    const selectedElements = elements.filter(el => selectedIds.includes(el.id));
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    selectedElements.forEach(el => {
      const b = getElementBounds(el);
      minX = Math.min(minX, b.minX); maxX = Math.max(maxX, b.maxX);
      minY = Math.min(minY, b.minY); maxY = Math.max(maxY, b.maxY);
    });
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  }, [elements, selectedIds]);

  // --- Shape Detection & Symmetry ---
  const detectShape = (points: Point[]) => {
    if (points.length < 15) return { type: 'path' };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, sumX = 0, sumY = 0;
    points.forEach(p => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      sumX += p.x; sumY += p.y;
    });
    const center = { x: sumX / points.length, y: sumY / points.length };
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Circle Check
    const distances = points.map(p => Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2)));
    const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((a, b) => a + Math.pow(b - avgDist, 2), 0) / distances.length;
    if (Math.sqrt(variance) / avgDist < 0.15) return { type: 'circle', bounds: { center, radius: avgDist } };

    // Rect Check
    const startEndDist = Math.sqrt(Math.pow(points[0].x - points[points.length-1].x, 2) + Math.pow(points[0].y - points[points.length-1].y, 2));
    if (startEndDist < Math.max(width, height) * 0.4) {
      let matching = 0;
      const thr = Math.max(width, height) * 0.15;
      points.forEach(p => {
        if (Math.abs(p.x-minX) < thr || Math.abs(p.x-maxX) < thr || Math.abs(p.y-minY) < thr || Math.abs(p.y-maxY) < thr) matching++;
      });
      if (matching / points.length > 0.8) return { type: 'rect', bounds: { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } } };
    }
    return { type: 'path' };
  };

  const applySymmetryToElement = (el: VectorElement, mode: SymmetryType): VectorElement[] => {
    const results = [el];
    if (mode === 'none') return results;
    const mirror = (e: VectorElement, sx: number, sy: number, suffix: string): VectorElement => ({
      ...JSON.parse(JSON.stringify(e)),
      id: Math.random().toString(36).substr(2, 9),
      scaleX: e.scaleX * sx, scaleY: e.scaleY * sy,
      x: sx === -1 ? -e.x : e.x, y: sy === -1 ? -e.y : e.y,
      name: e.name + ' ' + suffix
    });
    if (mode === 'vertical' || mode === 'quad') results.push(mirror(el, -1, 1, '(V)'));
    if (mode === 'horizontal' || mode === 'quad') results.push(mirror(el, 1, -1, '(H)'));
    if (mode === 'quad') results.push(mirror(el, -1, -1, '(Q)'));
    return results;
  };

  // --- Interaction Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldRaw = screenToWorld(screen);
    const world = snap(worldRaw);

    if (e.button === 1 || activeTool === 'pan') {
      isPanning.current = true;
      panStartScreen.current = screen;
      return;
    }

    // Node tool interaction
    if (activeTool === 'node') {
      const hSize = 10 / viewport.zoom;
      for (const el of elements) {
        if (selectedIds.includes(el.id)) {
          for (const node of el.nodes) {
            const nx = node.pos.x * el.scaleX + el.x;
            const ny = node.pos.y * el.scaleY + el.y;
            if (Math.abs(nx - worldRaw.x) < hSize && Math.abs(ny - worldRaw.y) < hSize) {
              nodeDragState.current = { elementId: el.id, nodeId: node.id };
              isDragging.current = true;
              dragStartWorld.current = worldRaw;
              return;
            }
          }
        }
      }
    }

    if (activeTool === 'select' && selectionBounds) {
      const hSize = 12 / viewport.zoom;
      const { x, y, w, h } = selectionBounds;
      const check = (hx: number, hy: number) => Math.abs(hx - worldRaw.x) < hSize && Math.abs(hy - worldRaw.y) < hSize;

      let found: TransformHandle = 'none';
      if (check(x, y)) found = 'tl';
      else if (check(x + w, y)) found = 'tr';
      else if (check(x, y + h)) found = 'bl';
      else if (check(x + w, y + h)) found = 'br';
      else if (check(x + w / 2, y - 30 / viewport.zoom)) found = 'rotate';

      if (found !== 'none') {
        setActiveHandle(found);
        isDragging.current = true;
        dragStartWorld.current = worldRaw;
        transformState.current = {
          initialElements: JSON.parse(JSON.stringify(elements.filter(el => selectedIds.includes(el.id)))),
          initialBounds: { ...selectionBounds },
          initialMouse: worldRaw, handle: found
        };
        return;
      }
    }

    isDragging.current = true;
    dragStartWorld.current = world;

    if (activeTool === 'pencil') {
      setPencilPoints([worldRaw]);
    } else if (activeTool === 'eraser') {
      performErase(worldRaw);
    } else if (activeTool === 'select' || activeTool === 'node') {
      const hit = elements.slice().reverse().find(el => {
        const b = getElementBounds(el);
        return worldRaw.x >= b.minX && worldRaw.x <= b.maxX && worldRaw.y >= b.minY && worldRaw.y <= b.maxY;
      });
      if (hit) {
        if (!selectedIds.includes(hit.id)) setSelectedIds(e.shiftKey ? [...selectedIds, hit.id] : [hit.id]);
      } else {
        if (!e.shiftKey) setSelectedIds([]);
        if (activeTool === 'select') setSelectionMarquee({ start: worldRaw, end: worldRaw });
      }
    } else if (['rect', 'circle', 'text'].includes(activeTool)) {
      const id = Math.random().toString(36).substr(2, 9);
      if (activeTool === 'text') {
        const txt = prompt("Label:", "FRONT");
        if (!txt) return;
        const newEl = { id, type: 'text', textContent: txt, nodes: [{ id: 'n', pos: world, type: 'corner' }], x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, fill: strokeColor, stroke: 'none', strokeWidth: 0, opacity: 1, visible: true, locked: false, layerId: 'l1', name: 'Label' } as VectorElement;
        const next = [...elements, ...applySymmetryToElement(newEl, symmetryMode)];
        setElements(next); saveHistory(next);
      } else {
        const newEl = { id, type: activeTool as any, nodes: [{ id: 'n1', pos: world, type: 'corner' }, { id: 'n2', pos: world, type: 'corner' }], x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, fill: fillColor, stroke: strokeColor, strokeWidth, opacity: 1, visible: true, locked: false, layerId: 'l1', name: 'Shape', closed: true } as VectorElement;
        const next = [...elements, ...applySymmetryToElement(newEl, symmetryMode)];
        setElements(next); setSelectedIds([id]); saveHistory(next);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldRaw = screenToWorld(screen);
    const world = snap(worldRaw);
    setCursorPos(screen);

    if (isPanning.current) {
      setViewport(v => ({ ...v, x: v.x + (screen.x - panStartScreen.current.x), y: v.y + (screen.y - panStartScreen.current.y) }));
      panStartScreen.current = screen;
      return;
    }

    if (isDragging.current) {
      if (nodeDragState.current) {
        const { elementId, nodeId } = nodeDragState.current;
        const dx = world.x - dragStartWorld.current.x;
        const dy = world.y - dragStartWorld.current.y;
        
        setElements(prev => prev.map(el => {
          if (el.id !== elementId) return el;
          return {
            ...el,
            nodes: el.nodes.map(n => {
              if (n.id !== nodeId) return n;
              return { ...n, pos: { x: n.pos.x + dx / el.scaleX, y: n.pos.y + dy / el.scaleY } };
            })
          };
        }));
        dragStartWorld.current = world;
        return;
      }

      if (activeHandle !== 'none' && transformState.current) {
        const { initialBounds, handle, initialElements } = transformState.current;
        const { cx, cy, w, h } = initialBounds;
        if (handle === 'rotate') {
          const angle = Math.atan2(worldRaw.y - cy, worldRaw.x - cx) * 180 / Math.PI + 90;
          setElements(prev => prev.map(el => {
            const initial = initialElements.find(ie => ie.id === el.id);
            if (!initial) return el;
            const rad = (angle - initial.rotation) * Math.PI / 180;
            const cos = Math.cos(rad); const sin = Math.sin(rad);
            const dx = initial.x - cx; const dy = initial.y - cy;
            return { ...el, rotation: angle, x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
          }));
        } else {
          let sx = 1, sy = 1;
          const dx = worldRaw.x - dragStartWorld.current.x; const dy = worldRaw.y - dragStartWorld.current.y;
          if (handle === 'br') { sx = (w + dx) / w; sy = (h + dy) / h; }
          else if (handle === 'tl') { sx = (w - dx) / w; sy = (h - dy) / h; }
          setElements(prev => prev.map(el => {
            const initial = initialElements.find(ie => ie.id === el.id);
            if (!initial) return el;
            const pX = handle.includes('l') ? initialBounds.x + w : initialBounds.x;
            const pY = handle.includes('t') ? initialBounds.y + h : initialBounds.y;
            return { ...el, scaleX: initial.scaleX * sx, scaleY: initial.scaleY * sy, x: pX + (initial.x - pX) * sx, y: pY + (initial.y - pY) * sy };
          }));
        }
        return;
      }
      if (selectionMarquee) setSelectionMarquee(p => p ? { ...p, end: worldRaw } : null);
      else if (activeTool === 'pencil') setPencilPoints(p => [...p, worldRaw]);
      else if (activeTool === 'eraser') performErase(worldRaw);
      else if (activeTool === 'select' && selectedIds.length > 0) {
        const dx = world.x - dragStartWorld.current.x; const dy = world.y - dragStartWorld.current.y;
        if (dx || dy) { setElements(p => p.map(el => selectedIds.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el)); dragStartWorld.current = world; }
      } else if (['rect', 'circle'].includes(activeTool) && selectedIds.length > 0) {
        setElements(p => p.map(el => el.id === selectedIds[0] ? { ...el, nodes: [el.nodes[0], { ...el.nodes[1], pos: world }] } : el));
      }
    }
  };

  const handleMouseUp = () => {
    if (selectionMarquee) {
      const m = selectionMarquee;
      const x1 = Math.min(m.start.x, m.end.x), x2 = Math.max(m.start.x, m.end.x);
      const y1 = Math.min(m.start.y, m.end.y), y2 = Math.max(m.start.y, m.end.y);
      const sel = elements.filter(el => { const b = getElementBounds(el); return b.minX >= x1 && b.maxX <= x2 && b.minY >= y1 && b.maxY <= y2; }).map(el => el.id);
      setSelectedIds(sel); setSelectionMarquee(null);
    }
    if (activeTool === 'pencil' && pencilPoints.length > 2) {
      const det = shapeAssist ? detectShape(pencilPoints) : { type: 'path' };
      let base: any;
      if (det.type === 'circle') base = { id: Math.random().toString(36).substr(2,9), type: 'circle', nodes: [{id:'c', pos:(det.bounds as any).center, type:'corner'}, {id:'r', pos:{x:(det.bounds as any).center.x+(det.bounds as any).radius, y:(det.bounds as any).center.y}, type:'corner'}], closed: true, fill: fillColor, stroke: strokeColor, strokeWidth, opacity:1, x:0,y:0,scaleX:1,scaleY:1,rotation:0, name:'Circle' };
      else if (det.type === 'rect') base = { id: Math.random().toString(36).substr(2,9), type: 'rect', nodes: [{id:'n1', pos:(det.bounds as any).min, type:'corner'}, {id:'n2', pos:(det.bounds as any).max, type:'corner'}], closed: true, fill: fillColor, stroke: strokeColor, strokeWidth, opacity:1, x:0,y:0,scaleX:1,scaleY:1,rotation:0, name:'Rect' };
      else base = { id: Math.random().toString(36).substr(2,9), type: 'path', nodes: pencilPoints.map((p,i)=>({id:`p${i}`, pos:p, type:'corner'})), closed: false, fill: 'none', stroke: strokeColor, strokeWidth, opacity:1, x:0,y:0,scaleX:1,scaleY:1,rotation:0, name:'Path' };
      const next = [...elements, ...applySymmetryToElement(base, symmetryMode)];
      setElements(next); saveHistory(next); setPencilPoints([]);
    }
    if (isDragging.current) saveHistory(elements);
    isDragging.current = false; isPanning.current = false; setActiveHandle('none'); transformState.current = null; nodeDragState.current = null;
  };

  const performErase = (p: Point) => {
    const rad = 15 / viewport.zoom;
    setElements(prev => prev.map(el => {
      const rem = el.nodes.filter(n => Math.sqrt(Math.pow(n.pos.x*el.scaleX+el.x - p.x, 2) + Math.pow(n.pos.y*el.scaleY+el.y - p.y, 2)) >= rad);
      return rem.length < 2 ? null : { ...el, nodes: rem };
    }).filter((el): el is VectorElement => el !== null));
  };

  // --- Rendering ---
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !containerRef.current) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = theme === 'dark' ? '#0a0a0a' : '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(viewport.x, viewport.y); ctx.scale(viewport.zoom, viewport.zoom);
    
    // Grid
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1 / viewport.zoom;
    for(let i=-2000; i<=2000; i+=20) { ctx.beginPath(); ctx.moveTo(i, -2000); ctx.lineTo(i, 2000); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-2000, i); ctx.lineTo(2000, i); ctx.stroke(); }
    
    // Symmetry
    if (symmetryMode !== 'none') {
      ctx.setLineDash([10/viewport.zoom, 5/viewport.zoom]); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1/viewport.zoom;
      if (symmetryMode === 'vertical' || symmetryMode === 'quad') { ctx.beginPath(); ctx.moveTo(0,-2000); ctx.lineTo(0,2000); ctx.stroke(); }
      if (symmetryMode === 'horizontal' || symmetryMode === 'quad') { ctx.beginPath(); ctx.moveTo(-2000,0); ctx.lineTo(2000,0); ctx.stroke(); }
      ctx.setLineDash([]);
    }

    // Elements
    elements.forEach(el => {
      ctx.save(); ctx.translate(el.x, el.y); ctx.rotate(el.rotation * Math.PI / 180); ctx.scale(el.scaleX, el.scaleY);
      if (el.type === 'text') { ctx.fillStyle = el.fill; ctx.font = `bold ${16/viewport.zoom}px Inter`; ctx.fillText(el.textContent||"", el.nodes[0].pos.x, el.nodes[0].pos.y); }
      else {
        ctx.beginPath();
        if (el.type === 'rect') ctx.rect(el.nodes[0].pos.x, el.nodes[0].pos.y, el.nodes[1].pos.x-el.nodes[0].pos.x, el.nodes[1].pos.y-el.nodes[0].pos.y);
        else if (el.type === 'circle') { const r = Math.sqrt(Math.pow(el.nodes[1].pos.x-el.nodes[0].pos.x,2)+Math.pow(el.nodes[1].pos.y-el.nodes[0].pos.y,2)); ctx.arc(el.nodes[0].pos.x, el.nodes[0].pos.y, r, 0, Math.PI*2); }
        else el.nodes.forEach((n,i) => i===0 ? ctx.moveTo(n.pos.x, n.pos.y) : ctx.lineTo(n.pos.x, n.pos.y));
        if (el.closed) ctx.closePath();
        if (el.fill !== 'none') { ctx.fillStyle = el.fill; ctx.fill(); }
        ctx.strokeStyle = el.stroke; ctx.lineWidth = el.strokeWidth / viewport.zoom; ctx.stroke();
      }
      ctx.restore();

      // Draw node handles if in node tool and selected
      if (activeTool === 'node' && selectedIds.includes(el.id)) {
        ctx.fillStyle = '#6366f1';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1 / viewport.zoom;
        const nSize = 6 / viewport.zoom;
        el.nodes.forEach(node => {
          const nx = node.pos.x * el.scaleX + el.x;
          const ny = node.pos.y * el.scaleY + el.y;
          // Temporarily escape the local transform for handle rendering to keep them size-constant
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.translate(viewport.x, viewport.y);
          ctx.scale(viewport.zoom, viewport.zoom);
          ctx.fillRect(nx - nSize/2, ny - nSize/2, nSize, nSize);
          ctx.strokeRect(nx - nSize/2, ny - nSize/2, nSize, nSize);
          ctx.restore();
        });
      }
    });

    // Overlays (Selection, Marquee, Pencil)
    if (selectionBounds && activeTool === 'select') {
      const { x, y, w, h } = selectionBounds;
      ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2/viewport.zoom; ctx.setLineDash([5/viewport.zoom]); ctx.strokeRect(x,y,w,h); ctx.setLineDash([]);
      ctx.fillStyle = 'white'; const hs = 10/viewport.zoom;
      [[x,y],[x+w,y],[x,y+h],[x+w,y+h],[x+w/2,y-30/viewport.zoom]].forEach(([hx,hy],i) => {
        ctx.beginPath(); if (i===4) ctx.arc(hx,hy,hs/1.5,0,Math.PI*2); else ctx.rect(hx-hs/2,hy-hs/2,hs,hs); ctx.fill(); ctx.stroke();
      });
    }
    if (selectionMarquee) { ctx.fillStyle='rgba(99,102,241,0.1)'; ctx.strokeStyle='#6366f1'; const {start,end}=selectionMarquee; ctx.fillRect(start.x,start.y,end.x-start.x,end.y-start.y); ctx.strokeRect(start.x,start.y,end.x-start.x,end.y-start.y); }
    if (pencilPoints.length > 0) {
      const dp = (pts: Point[], sx: number, sy: number) => {
        ctx.beginPath(); ctx.strokeStyle = strokeColor; ctx.lineWidth = strokeWidth / viewport.zoom;
        pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x*sx, p.y*sy) : ctx.lineTo(p.x*sx, p.y*sy)); ctx.stroke();
      };
      dp(pencilPoints, 1, 1);
      if (symmetryMode === 'vertical' || symmetryMode === 'quad') dp(pencilPoints, -1, 1);
      if (symmetryMode === 'horizontal' || symmetryMode === 'quad') dp(pencilPoints, 1, -1);
      if (symmetryMode === 'quad') dp(pencilPoints, -1, -1);
    }
  }, [elements, viewport, theme, selectedIds, selectionBounds, selectionMarquee, pencilPoints, symmetryMode, strokeColor, strokeWidth, fillColor, activeTool]);

  useEffect(() => { const f = setInterval(drawScene, 16); return () => clearInterval(f); }, [drawScene]);
  useEffect(() => { const r = () => { if (canvasRef.current && containerRef.current) { canvasRef.current.width = containerRef.current.clientWidth; canvasRef.current.height = containerRef.current.clientHeight; } }; window.addEventListener('resize', r); r(); return () => window.removeEventListener('resize', r); }, []);

  const TabBtn = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button onClick={() => setActiveSidebarTab(id)} className={`flex-1 flex flex-col items-center py-3 gap-1 border-b-2 transition-all ${activeSidebarTab === id ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
      <Icon size={18} />
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] overflow-hidden ${theme === 'dark' ? 'bg-[#0a0a0a] text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
      {/* CAD Toolbar */}
      <div className={`h-14 flex items-center px-4 border-b ${theme === 'dark' ? 'bg-[#121212] border-[#222]' : 'bg-white border-gray-200'} z-50 gap-4 shadow-lg`}>
        <div className="flex gap-1 pr-4 border-r border-white/5">
          <button onClick={undo} disabled={historyIndex === 0} className="p-2 text-gray-400 hover:text-white disabled:opacity-20"><Undo2 size={18}/></button>
          <button onClick={redo} disabled={historyIndex === history.length-1} className="p-2 text-gray-400 hover:text-white disabled:opacity-20"><Redo2 size={18}/></button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSymmetryMode('none')} className={`px-2 py-1 rounded text-[10px] font-bold ${symmetryMode==='none'?'bg-indigo-600':'bg-white/5'}`}>NONE</button>
          <button onClick={() => setSymmetryMode('vertical')} className={`p-1.5 rounded ${symmetryMode==='vertical'?'bg-indigo-600 text-white':'text-gray-500 bg-white/5'}`}><Columns size={14}/></button>
          <button onClick={() => setSymmetryMode('horizontal')} className={`p-1.5 rounded ${symmetryMode==='horizontal'?'bg-indigo-600 text-white':'text-gray-500 bg-white/5'}`}><Rows size={14}/></button>
          <button onClick={() => setSymmetryMode('quad')} className={`p-1.5 rounded ${symmetryMode==='quad'?'bg-indigo-600 text-white':'text-gray-500 bg-white/5'}`}><Grid2X2 size={14}/></button>
        </div>
        <div className="w-[1px] h-6 bg-white/5 mx-2" />
        <button onClick={() => setSnapToGrid(!snapToGrid)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-2 ${snapToGrid ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500'}`}><Grid3X3 size={14}/> SNAPPING</button>
        <button onClick={() => setShapeAssist(!shapeAssist)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-2 ${shapeAssist ? 'bg-amber-600/20 text-amber-500' : 'text-gray-500'}`}><Zap size={14}/> ASSIST</button>
        <div className="flex-grow" />
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border border-white/20" style={{backgroundColor: strokeColor}} />
          <button onClick={() => { setElements(elements.filter(el=>!selectedIds.includes(el.id))); setSelectedIds([]); }} className="text-gray-500 hover:text-red-500"><Trash2 size={18}/></button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Left Tool Sidebar */}
        <div className="w-14 border-r bg-[#121212] flex flex-col items-center py-4 gap-1 z-40 overflow-y-auto custom-scrollbar">
          {[
            {id:'select',icon:MousePointer2}, 
            {id:'node',icon:MousePointerSquareDashed},
            {id:'tweak',icon:Wand2},
            {id:'spray',icon:SprayCan},
            {id:'brush',icon:Brush},
            {id:'pencil',icon:Pencil},
            {id:'bezier',icon:PenTool},
            {id:'rect',icon:Square},
            {id:'circle',icon:CircleDot},
            {id:'poly',icon:Pentagon},
            {id:'star',icon:Star},
            {id:'spiral',icon:RefreshCw},
            {id:'box3d',icon:Boxes},
            {id:'text',icon:Type},
            {id:'gradient',icon:Palette},
            {id:'dropper',icon:Eyedropper},
            {id:'bucket',icon:PaintBucket},
            {id:'eraser',icon:Eraser},
            {id:'measure',icon:Ruler},
            {id:'zoom',icon:ZoomIn},
            {id:'pan',icon:Hand} 
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTool(t.id as ToolType)} className={`p-2.5 rounded-xl transition-all shrink-0 ${activeTool === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><t.icon size={18} /></button>
          ))}
        </div>

        {/* Tabbed Side Panel */}
        <div className="w-80 border-r bg-[#121212] flex flex-col z-40 shadow-2xl overflow-hidden">
          <div className="flex border-b border-white/5 bg-black/40">
            <TabBtn id="measurements" icon={Sliders} label="Measures" />
            <TabBtn id="blocks" icon={Library} label="Blocks" />
            <TabBtn id="ai" icon={Sparkles} label="AI Asst" />
            <TabBtn id="properties" icon={Sliders} label="Object" />
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
            {activeSidebarTab === 'properties' && (
              <div className="space-y-6">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Object Properties</p>
                {selectedIds.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-white/40">Scale X</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={elements.find(e => e.id === selectedIds[0])?.scaleX || 1}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, scaleX: val } : el));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-white/40">Scale Y</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={elements.find(e => e.id === selectedIds[0])?.scaleY || 1}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, scaleY: val } : el));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-white/40">Rotation</label>
                      <input 
                        type="range" 
                        min="0" max="360"
                        value={elements.find(e => e.id === selectedIds[0])?.rotation || 0}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, rotation: val } : el));
                        }}
                        className="w-full h-1 bg-white/5 accent-indigo-500 rounded appearance-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-white/40">Stroke Color</label>
                      <input 
                        type="color"
                        value={elements.find(e => e.id === selectedIds[0])?.stroke || '#ffffff'}
                        onChange={e => {
                          const val = e.target.value;
                          setElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, stroke: val } : el));
                        }}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-white/40">Fill Color</label>
                      <input 
                        type="color"
                        value={elements.find(e => e.id === selectedIds[0])?.fill === 'none' ? '#000000' : (elements.find(e => e.id === selectedIds[0])?.fill || '#000000')}
                        onChange={e => {
                          const val = e.target.value;
                          setElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, fill: val } : el));
                        }}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/20 italic">Select an object to edit its properties</p>
                )}
              </div>
            )}
            {activeSidebarTab === 'measurements' && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Body Specifications (IN)</p>
                {Object.entries(measurements).map(([k,v]) => (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase text-white/40"><span>{k}</span><span className="text-white font-bold">{v}</span></div>
                    <input type="range" value={v} step={0.25} onChange={e=>setMeasurements(p=>({...p,[k]:parseFloat(e.target.value)}))} className="w-full h-1 bg-white/5 accent-indigo-500 rounded appearance-none" />
                  </div>
                ))}
              </div>
            )}

            {activeSidebarTab === 'blocks' && (
              <div className="space-y-6">
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                  {(['women', 'men', 'children', 'unisex'] as const).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setBlockCategory(cat)}
                      className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${blockCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {blockCategory === 'women' && [
                    { name: 'Basic Bodice', icon: Shirt, action: () => setElements([...elements, ...Blocks.generateWomenBodice(measurements)]) },
                    { name: 'Straight Skirt', icon: Square, action: () => setElements([...elements, ...Blocks.generateWomenSkirt(measurements)]) },
                    { name: 'Tailored Pants', icon: Columns, action: () => setElements([...elements, ...Blocks.generatePantsBlock(measurements, false)]) },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all text-sm font-bold group">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all"><item.icon size={18}/></div>
                      <span className="flex-grow text-left">{item.name}</span>
                      <ChevronRight size={16} className="text-indigo-400/40" />
                    </button>
                  ))}

                  {blockCategory === 'men' && [
                    { name: 'Dress Shirt', icon: Shirt, action: () => setElements([...elements, ...Blocks.generateMensShirt(measurements)]) },
                    { name: 'Classic Trouser', icon: Columns, action: () => setElements([...elements, ...Blocks.generatePantsBlock(measurements, true)]) },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all text-sm font-bold group">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all"><item.icon size={18}/></div>
                      <span className="flex-grow text-left">{item.name}</span>
                      <ChevronRight size={16} className="text-indigo-400/40" />
                    </button>
                  ))}

                  {blockCategory === 'children' && [
                    { name: 'Basic Bodice', icon: Baby, action: () => setElements([...elements, ...Blocks.generateChildBodice(measurements)]) },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all text-sm font-bold group">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all"><item.icon size={18}/></div>
                      <span className="flex-grow text-left">{item.name}</span>
                      <ChevronRight size={16} className="text-indigo-400/40" />
                    </button>
                  ))}

                  {blockCategory === 'unisex' && (
                    <div className="py-10 text-center space-y-2">
                       <Box size={32} className="mx-auto text-white/10" />
                       <p className="text-[10px] font-bold text-white/20 uppercase">Coming Soon</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSidebarTab === 'ai' && (
              <div className="space-y-6">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">AI Pattern Generator</p>
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <p className="text-xs text-indigo-200/60 leading-relaxed italic">"Upload a photo of a garment or sketch to generate proportional pattern guidance based on your measurements."</p>
                </div>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center gap-3 bg-black/20 hover:border-indigo-500/40 transition-all cursor-pointer">
                  <div className="p-3 bg-indigo-600 rounded-full shadow-lg"><Camera size={24} className="text-white"/></div>
                  <p className="text-xs font-bold text-white/40 uppercase">Upload Reference</p>
                </div>
                <button 
                  disabled={user.role === UserRole.FREE}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl transition-all ${user.role === UserRole.FREE ? 'bg-gray-800 text-gray-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 active:scale-95'}`}
                >
                  <Wand2 size={16}/> Generate Pattern
                </button>
                {user.role === UserRole.FREE && (
                  <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-200/80">
                    <Info size={12} className="shrink-0"/>
                    <span>AI Pattern Generation is a <b>Premium</b> feature. Upgrade to unlock.</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-black/40 border-t border-white/5">
             <div className="flex justify-between items-center text-[9px] font-bold text-white/30 uppercase mb-2">
                <span>Viewport</span>
                <span>{Math.round(viewport.zoom*100)}%</span>
             </div>
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{width: `${viewport.zoom*50}%`}} />
             </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div ref={containerRef} className="flex-grow relative bg-[#080808] overflow-hidden">
          <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onContextMenu={e=>e.preventDefault()} style={{cursor: activeTool === 'pan' ? 'grab' : 'crosshair'}} className="absolute inset-0" />
          
          {/* Zoom UI */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-xl p-2 rounded-full border border-white/10 z-50 shadow-2xl">
            <button onClick={() => setViewport(v => ({...v, zoom: v.zoom * 0.8}))} className="p-2 text-white/40 hover:text-white transition-colors"><Search size={16}/></button>
            <span className="text-xs font-mono text-indigo-400 font-black min-w-[50px] text-center">{Math.round(viewport.zoom * 100)}%</span>
            <button onClick={() => setViewport(v => ({...v, zoom: v.zoom * 1.2}))} className="p-2 text-white/40 hover:text-white transition-colors"><ZoomIn size={16}/></button>
          </div>
          
          {/* Info Badge */}
          <div className="absolute top-6 left-6 flex items-center gap-3 pointer-events-none opacity-40">
             <div className="px-3 py-1.5 bg-black rounded border border-white/5 text-[9px] font-mono text-cyan-400">UNIT: INCHES</div>
             <div className="px-3 py-1.5 bg-black rounded border border-white/5 text-[9px] font-mono text-indigo-400">CANVAS: MASHAL V1.0</div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="w-14 border-l bg-[#121212] flex flex-col items-center py-8 gap-6 z-40">
           <button onClick={() => downloadPatternPDF("Draft", "CAD", canvasRef.current?.toDataURL() || "", user.role)} className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all shadow-indigo-600/30" title="Export PDF"><FileOutput size={20}/></button>
           <button onClick={() => setElements([])} className="p-3 text-white/10 hover:text-red-500 transition-colors" title="Clear Canvas"><Trash2 size={20}/></button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #6366f1; border-radius: 50%; cursor: pointer; border: 2px solid #000; }
      `}</style>
    </div>
  );
};

export default Workspace;
