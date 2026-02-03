
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
            <stop offset="0%" stopColor="black" stopOpacity="0.15" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Global Grid */}
        <line x1={width/2} y1="0" x2={width/2} y2={height} stroke="black" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.1" />
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="black" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.1" />

        {/* Thirds System */}
        <line x1={v1} y1="0" x2={v1} y2={height} stroke="#ddd" strokeWidth="0.5" opacity="0.3" />
        <line x1={v2} y1="0" x2={v2} y2={height} stroke="#ddd" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1={h1} x2={width} y2={h1} stroke="#ddd" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1={h2} x2={width} y2={h2} stroke="#ddd" strokeWidth="0.5" opacity="0.3" />

        {/* Bounding Constraint */}
        <rect 
          x={boundingBox.x} 
          y={boundingBox.y} 
          width={boundingBox.width} 
          height={boundingBox.height} 
          fill="none" 
          stroke="black" 
          strokeWidth="0.5" 
          vectorEffect="non-scaling-stroke"
          opacity="0.4"
        />

        {/* Centroid Identification */}
        <circle cx={centerOfMass.x} cy={centerOfMass.y} r={Math.min(width, height) * 0.12} fill="url(#centroidGlow)" />
        <circle cx={centerOfMass.x} cy={centerOfMass.y} r="2.5" fill="black" />
        
        {/* Bias Vectors */}
        <line x1={width/2} y1={height/2} x2={centerOfMass.x} y2={centerOfMass.y} stroke="black" strokeWidth="0.3" strokeDasharray="1 1" />
        
        {/* Corner Precision Notches */}
        <g stroke="black" strokeWidth="0.75" fill="none" opacity="0.6">
          <path d={`M ${boundingBox.x},${boundingBox.y + 6} V ${boundingBox.y} H ${boundingBox.x + 6}`} />
          <path d={`M ${boundingBox.x + boundingBox.width - 6},${boundingBox.y} H ${boundingBox.x + boundingBox.width} V ${boundingBox.y + 6}`} />
          <path d={`M ${boundingBox.x},${boundingBox.y + boundingBox.height - 6} V ${boundingBox.y + boundingBox.height} H ${boundingBox.x + 6}`} />
          <path d={`M ${boundingBox.x + boundingBox.width - 6},${boundingBox.y + boundingBox.height} H ${boundingBox.x + boundingBox.width} V ${boundingBox.y + boundingBox.height - 6}`} />
        </g>
      </svg>
      
      {/* Real-time Metadata Data-plates */}
      <div className="absolute top-2 left-2 text-[5px] mono text-neutral-300 uppercase select-none font-bold">
        TRACE_ENGAGED
      </div>
      <div className="absolute top-2 right-2 text-[5px] mono text-neutral-300 text-right uppercase select-none">
        {boundingBox.width.toFixed(0)}x{boundingBox.height.toFixed(0)}
      </div>
      
      <div className="absolute bottom-2 left-2 flex flex-col gap-0.5">
        <div className="bg-black text-white text-[6px] mono px-1 py-0.5 tracking-tighter">CENTROID: {centerOfMass.x.toFixed(0)}, {centerOfMass.y.toFixed(0)}</div>
        <div className="bg-white/90 backdrop-blur-sm border border-neutral-100 text-[6px] mono px-1 py-0.5 text-neutral-400">Δ: {metrics.center_offset_x.toFixed(2)}%</div>
      </div>

      {/* Volumetric Balance Gauge */}
      <div className="absolute right-2 bottom-2 flex flex-col items-end gap-1">
        <div className="flex gap-0.5 h-0.5 w-16 bg-neutral-100 overflow-hidden">
          <div 
            className="bg-black h-full transition-all duration-1000" 
            style={{ width: `${metrics.weight_left}%`, opacity: 0.8 }} 
          />
          <div 
            className="bg-neutral-300 h-full transition-all duration-1000" 
            style={{ width: `${metrics.weight_right}%` }} 
          />
        </div>
        <div className="text-[5px] mono text-neutral-400 uppercase font-bold">Vol_Bal</div>
      </div>
    </div>
  );
};

export default StructuralOverlay;
