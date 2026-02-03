
import React from 'react';
import { LogoMetrics } from '../types';

interface Props {
  metrics: LogoMetrics;
  imageSrc: string;
}

const StructuralOverlay: React.FC<Props> = ({ metrics, imageSrc }) => {
  const { width, height, boundingBox, centerOfMass } = metrics;
  
  // Grid divisions
  const v1 = width / 3;
  const v2 = (width / 3) * 2;
  const h1 = height / 3;
  const h2 = (height / 3) * 2;

  return (
    <div className="relative w-full aspect-square bg-transparent flex items-center justify-center overflow-hidden">
      {/* Ghost Artifact */}
      <img 
        src={imageSrc} 
        alt="Background artifact" 
        className="max-w-[90%] max-h-[90%] object-contain opacity-10 grayscale transition-opacity duration-1000 blur-[2px] mix-blend-multiply"
      />
      
      {/* Precision Diagnostics SVG */}
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-700"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="centroidGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="black" stopOpacity="0.2" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Global Grid */}
        <line x1={width/2} y1="0" x2={width/2} y2={height} stroke="black" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.2" />
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="black" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.2" />

        {/* Thirds System */}
        <line x1={v1} y1="0" x2={v1} y2={height} stroke="#eee" strokeWidth="0.5" />
        <line x1={v2} y1="0" x2={v2} y2={height} stroke="#eee" strokeWidth="0.5" />
        <line x1="0" y1={h1} x2={width} y2={h1} stroke="#eee" strokeWidth="0.5" />
        <line x1="0" y1={h2} x2={width} y2={h2} stroke="#eee" strokeWidth="0.5" />

        {/* Bounding Constraint */}
        <rect 
          x={boundingBox.x} 
          y={boundingBox.y} 
          width={boundingBox.width} 
          height={boundingBox.height} 
          fill="none" 
          stroke="black" 
          strokeWidth="0.75" 
          vectorEffect="non-scaling-stroke"
          opacity="0.6"
        />

        {/* Centroid Identification */}
        <circle cx={centerOfMass.x} cy={centerOfMass.y} r={Math.min(width, height) * 0.15} fill="url(#centroidGlow)" />
        <circle cx={centerOfMass.x} cy={centerOfMass.y} r="3" fill="black" />
        
        {/* Bias Vectors */}
        <line x1={width/2} y1={height/2} x2={centerOfMass.x} y2={centerOfMass.y} stroke="black" strokeWidth="0.5" strokeDasharray="1 1" />
        
        {/* Corner Precision Notches */}
        <g stroke="black" strokeWidth="1" fill="none">
          <path d={`M ${boundingBox.x},${boundingBox.y + 8} V ${boundingBox.y} H ${boundingBox.x + 8}`} />
          <path d={`M ${boundingBox.x + boundingBox.width - 8},${boundingBox.y} H ${boundingBox.x + boundingBox.width} V ${boundingBox.y + 8}`} />
          <path d={`M ${boundingBox.x},${boundingBox.y + boundingBox.height - 8} V ${boundingBox.y + boundingBox.height} H ${boundingBox.x + 8}`} />
          <path d={`M ${boundingBox.x + boundingBox.width - 8},${boundingBox.y + boundingBox.height} H ${boundingBox.x + boundingBox.width} V ${boundingBox.y + boundingBox.height - 8}`} />
        </g>

        {/* Load indicators on axes */}
        <circle cx={width/2} cy={boundingBox.y} r="1.5" fill="black" />
        <circle cx={width/2} cy={boundingBox.y + boundingBox.height} r="1.5" fill="black" />
        <circle cx={boundingBox.x} cy={height/2} r="1.5" fill="black" />
        <circle cx={boundingBox.x + boundingBox.width} cy={height/2} r="1.5" fill="black" />
      </svg>
      
      {/* Real-time Metadata Data-plates */}
      <div className="absolute top-2 left-2 text-[7px] mono text-neutral-300 uppercase select-none">
        MAPPING_ACTIVE
      </div>
      <div className="absolute top-2 right-2 text-[7px] mono text-neutral-300 text-right uppercase select-none">
        BOUNDS: {boundingBox.width.toFixed(0)}x{boundingBox.height.toFixed(0)}
      </div>
      
      <div className="absolute bottom-2 left-2 flex flex-col gap-1">
        <div className="bg-black text-white text-[8px] mono px-2 py-0.5 tracking-tighter">CENTROID: {centerOfMass.x.toFixed(1)}, {centerOfMass.y.toFixed(1)}</div>
        <div className="bg-white/80 backdrop-blur-sm border border-neutral-100 text-[8px] mono px-2 py-0.5 text-neutral-400">OFFSET_Δ: {metrics.center_offset_x.toFixed(2)}%</div>
      </div>

      {/* Volumetric Balance Gauge */}
      <div className="absolute right-2 bottom-2 flex flex-col items-end gap-1">
        <div className="flex gap-1 h-1.5 w-24 bg-neutral-100 overflow-hidden">
          <div 
            className="bg-black h-full transition-all duration-1000" 
            style={{ width: `${metrics.weight_left}%`, opacity: 0.8 }} 
          />
          <div 
            className="bg-neutral-300 h-full transition-all duration-1000" 
            style={{ width: `${metrics.weight_right}%` }} 
          />
        </div>
        <div className="text-[7px] mono text-neutral-400">VOLUME_BALANCE_H</div>
      </div>
    </div>
  );
};

export default StructuralOverlay;
