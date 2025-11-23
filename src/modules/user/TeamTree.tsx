import React, { useRef, useState } from 'react';
import { Minus, Plus, RefreshCw } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export interface TeamMember {
  id: number | string;
  name: string;
  position: string;
  department: string;
  image: string;
  managerId?: number | string | null;
  email?: string;
  children?: TeamMember[];
  [key: string]: any;
}

interface TeamTreeProps {
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
}

export function TeamTree({ members, onMemberClick }: TeamTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Build Tree Structure
  const treeData = React.useMemo(() => {
    const map = new Map<string | number, TeamMember>();
    // Clone members to avoid mutating props and reset children
    const nodes: TeamMember[] = members.map(m => ({ ...m, children: [] }));
    
    nodes.forEach(node => {
      map.set(node.id, node);
    });

    const roots: TeamMember[] = [];
    nodes.forEach(node => {
      if (node.managerId && map.has(node.managerId)) {
        const parent = map.get(node.managerId);
        parent?.children?.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [members]);

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.001;
    const newScale = Math.min(Math.max(0.1, scale - e.deltaY * zoomSensitivity), 3);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-screen border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <button 
          onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
          className="p-2 bg-white shadow-md rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <Minus size={20} />
        </button>
        <button 
          onClick={resetView}
          className="p-2 bg-white shadow-md rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <RefreshCw size={20} />
        </button>
        <button 
          onClick={() => setScale(s => Math.min(3, s + 0.1))}
          className="p-2 bg-white shadow-md rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <Plus size={20} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <div className="pt-10 pb-10">
             {treeData.map(root => (
               <TreeNode key={root.id} node={root} onNodeClick={onMemberClick} />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node, onNodeClick }: { node: TeamMember, onNodeClick?: (node: TeamMember) => void }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative z-10 mb-4">
        {/* Node Card */}
        <div 
          onClick={() => onNodeClick?.(node)}
          className="w-64 bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-3 cursor-pointer hover:border-blue-300 group"
        >
          <ImageWithFallback
            src={node.image}
            alt={node.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="min-w-0 text-left">
            <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{node.name}</h4>
            <p className="text-xs text-blue-600 truncate">{node.position}</p>
            <p className="text-xs text-gray-500 truncate">{node.department}</p>
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className="flex flex-col items-center">
          {/* Vertical line from parent to children bar */}
          <div className="w-px h-8 bg-gray-300 -mt-4 mb-0"></div>
          
          {/* Children Container */}
          <div className="flex gap-8 relative pt-4">
             {/* Horizontal connecting line */}
             {node.children!.length > 1 && (
               <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 mx-[calc(50%-1px/2)] transform -translate-y-full" 
                    style={{ 
                      left: '50%', 
                      right: 'auto',
                      width: 'calc(100% - 16rem)',
                    }}>
               </div>
             )}
             
             {node.children!.map((child, index) => (
               <TreeBranch 
                  key={child.id} 
                  node={child} 
                  isFirst={index === 0} 
                  isLast={index === node.children!.length - 1} 
                  isSingle={node.children!.length === 1} 
                  onNodeClick={onNodeClick}
               />
             ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TreeBranch({ node, isFirst, isLast, isSingle, onNodeClick }: { node: TeamMember, isFirst: boolean, isLast: boolean, isSingle: boolean, onNodeClick?: (node: TeamMember) => void }) {
  return (
    <div className="flex flex-col items-center relative">
      {/* Top connecting lines */}
      {!isSingle && (
        <>
          {/* Horizontal line to cover the left/right spacing */}
          <div className={`absolute top-0 h-px bg-gray-300 w-1/2 ${isFirst ? 'right-0' : 'left-0'} ${isFirst || isLast ? 'block' : 'hidden'}`}></div>
          {/* For middle elements, we need full width */}
          {!isFirst && !isLast && (
             <div className="absolute top-0 h-px bg-gray-300 w-full left-0"></div>
          )}
        </>
      )}
      
      {/* Vertical line connecting to the node */}
      <div className="w-px h-8 bg-gray-300"></div>
      
      <TreeNode node={node} onNodeClick={onNodeClick} />
    </div>
  );
}