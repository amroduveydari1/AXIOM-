
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { LogoMetrics, AnalysisResponse } from "../types";

export const analyzeLogoStructure = async (metrics: LogoMetrics): Promise<AnalysisResponse> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured. Please add your API key to .env file.');
  }
  
  const ai = new GoogleGenerativeAI(apiKey);
  
  const prompt = `
    Perform a deep forensic deconstruction of this visual artifact using the provided Euclidean metrics.
    
    Metrics Overview:
    - Vertical Symmetry: ${metrics.symmetry_vertical}
    - Horizontal Symmetry: ${metrics.symmetry_horizontal}
    - Centroid Offset (X,Y): ${metrics.center_offset_x.toFixed(3)}%, ${metrics.center_offset_y.toFixed(3)}%
    - Volumetric Weights: Left:${metrics.weight_left.toFixed(2)}%, Right:${metrics.weight_right.toFixed(2)}%, Top:${metrics.weight_top.toFixed(2)}%, Bottom:${metrics.weight_bottom.toFixed(2)}%
    - Pixel Density: ${metrics.density.toFixed(2)}%
    - Structural Complexity (Node Density): ${metrics.complexity_index.toFixed(4)}
    
    Requirements:
    1. Analysis must be clinical, objective, and authoritative. Use terminology: "Axial Tension", "Geometric Load", "Morphological Variance", "Euclidean Balance".
    2. Market Grounding: Use Google Search to identify if this silhouette structure follows current luxury, tech, or industrial trends. Compare its "massing" to established global icons.
    3. Recommendations: Provide 3 high-impact geometric adjustments to optimize the 'Structural Harmony Index'.
    4. Provide a Score (0-100) representing pure mathematical formal excellence.

    Strict JSON output only.
  `;

  const model = ai.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: "You are the AXIOM Forensic Interface. You analyze visual structures with the cold precision of a structural engineer. You provide objective design diagnostics based on mathematical weight distribution and market grounding.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          structural_summary: { type: SchemaType.STRING, description: "A forensic overview of the artifact's formal integrity." },
          balance_analysis: { type: SchemaType.STRING, description: "Detailed critique of the volumetric load distribution." },
          geometry_analysis: { type: SchemaType.STRING, description: "Assessment of the bounding box efficiency and aspect ratio." },
          alignment_analysis: { type: SchemaType.STRING, description: "Analysis of centroid displacement and axial nodes." },
          market_context: { type: SchemaType.STRING, description: "Grounding report on current visual industry standards." },
          remedial_actions: { 
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Three specific architectural adjustments."
          },
          score: { type: SchemaType.NUMBER, description: "Structural Harmony Index (0-100)." }
        },
        required: ["structural_summary", "balance_analysis", "geometry_analysis", "alignment_analysis", "market_context", "remedial_actions", "score"]
      }
    }
  });

  const response = await model.generateContent(prompt);

  const text = response.response.text() || '{}';
  const groundingChunks = response.response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundingUrls = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({ title: chunk.web!.title, uri: chunk.web!.uri }));

  try {
    const data = JSON.parse(text) as AnalysisResponse;
    return { ...data, groundingUrls };
  } catch (e) {
    console.error("Critical JSON parse error:", e);
    return {
      structural_summary: "Parsing failure: Response stream corrupted.",
      balance_analysis: "Unavailable.",
      geometry_analysis: "Unavailable.",
      alignment_analysis: "Unavailable.",
      market_context: "Grounding unreachable.",
      remedial_actions: ["System Reboot Recommended", "Re-scan Artifact"],
      score: 0
    };
  }
};
