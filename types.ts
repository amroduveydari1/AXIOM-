
export interface LogoMetrics {
  width: number;
  height: number;
  aspect_ratio: number;
  symmetry_vertical: 'high' | 'medium' | 'low';
  symmetry_horizontal: 'high' | 'medium' | 'low';
  center_offset_x: number;
  center_offset_y: number;
  weight_left: number;
  weight_right: number;
  weight_top: number;
  weight_bottom: number;
  density: number; // Percentage of filled pixels in bounding box
  complexity_index: number; // Rough measure of edge/fill ratio
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  centerOfMass: {
    x: number;
    y: number;
  };
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AnalysisResponse {
  structural_summary: string;
  balance_analysis: string;
  geometry_analysis: string;
  alignment_analysis: string;
  remedial_actions: string[];
  market_context?: string;
  score: number;
  groundingUrls?: { title: string; uri: string }[];
}

export type AppState = 'landing' | 'upload' | 'analyzing' | 'results';
