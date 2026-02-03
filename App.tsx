
import React, { useState, useEffect, useRef } from 'react';
import { getLogoMetrics } from './utils/analysis';
import { analyzeLogoStructure } from './services/gemini';
import { LogoMetrics, AnalysisResponse, AppState } from './types';
import StructuralOverlay from './components/StructuralOverlay';
import { jsPDF } from 'jspdf';

const ANALYSIS_STEPS = [
  "Mounting Euclidean Core...",
  "Isolating Volumetric Centroid...",
  "Mapping Morphological Load...",
  "Quantifying Axial Deviation...",
  "Grounding Market Patterns...",
  "Generating Corrective Protocol..."
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('landing');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<LogoMetrics | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: number;
    if (state === 'analyzing') {
      setAnalysisStep(0);
      interval = window.setInterval(() => {
        setAnalysisStep(prev => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
      }, 250);
    }
    return () => clearInterval(interval);
  }, [state]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('FORMAT_ERROR: TYPE_MISMATCH');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setState('upload');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const startAnalysis = async () => {
    if (!imageSrc) return;
    setState('analyzing');
    setError(null);
    try {
      const [extractedMetrics] = await Promise.all([
        getLogoMetrics(imageSrc),
      ]);
      
      setMetrics(extractedMetrics);
      const aiResponse = await analyzeLogoStructure(extractedMetrics);
      setAnalysis(aiResponse);
      
      setState('results');
    } catch (err) {
      setError('SYSTEM_FAULT: DIAGNOSTIC_TIMEOUT');
      setState('upload');
    }
  };

  const generatePDF = () => {
    if (!analysis || !metrics) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("AXIOM REPORT", 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`DATE: ${new Date().toLocaleString()}`, 20, y);
    doc.text(`SYSTEM: AXIOM CORE`, pageWidth - 70, y);
    y += 15;

    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.line(20, y, pageWidth - 20, y);
    y += 20;

    doc.setFontSize(12);
    doc.text("STRUCTURAL HARMONY INDEX (SHI)", 20, y);
    y += 15;
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    doc.text(String(analysis.score), 20, y);
    y += 25;

    const sections = [
      { title: "MORPHOLOGICAL INTEGRITY", text: analysis.structural_summary },
      { title: "VOLUMETRIC LOGIC", text: analysis.balance_analysis },
      { title: "GEOMETRIC TENSION", text: analysis.geometry_analysis },
      { title: "AXIAL CRITIQUE", text: analysis.alignment_analysis },
      { title: "MARKET CONTEXT", text: analysis.market_context }
    ];

    doc.setFontSize(10);
    sections.forEach(s => {
      doc.setFont("helvetica", "bold");
      doc.text(s.title, 20, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(s.text || "", pageWidth - 40);
      doc.text(lines, 20, y);
      y += (lines.length * 6) + 10;
      
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.setFont("helvetica", "bold");
    doc.text("REMEDIAL PROTOCOL", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    analysis.remedial_actions.forEach((action, i) => {
      doc.text(`${i + 1}. ${action}`, 20, y);
      y += 7;
    });

    doc.save(`AXIOM-REPORT-${Date.now()}.pdf`);
  };

  const reset = () => {
    setImageSrc(null);
    setMetrics(null);
    setAnalysis(null);
    setError(null);
    setState('landing');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      className={`min-h-screen bg-[#fafafa] text-black transition-all duration-700 ease-in-out font-sans ${isDragging ? 'bg-[#f0f0f0]' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) processFile(file); }}
    >
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] select-none" 
           style={{ backgroundImage: 'linear-gradient(#000 0.5px, transparent 0.5px), linear-gradient(90deg, #000 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-8 md:py-20 flex flex-col min-h-screen">
        <header className="flex justify-between items-baseline border-b border-black/10 pb-6 mb-12 md:mb-24">
          <div className="flex flex-col group cursor-pointer" onClick={reset}>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">
              AXIOM
            </h1>
          </div>
          <div className="hidden md:flex gap-12 text-[10px] mono uppercase text-neutral-400">
            <span className="flex items-center gap-2 text-black font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              DIAGNOSTIC_READY
            </span>
            <button onClick={reset} className="hover:text-black transition-colors underline underline-offset-4 decoration-black/10">Archive</button>
            <a href="#" className="hover:text-black transition-colors underline underline-offset-4 decoration-black/10">Protocol_Manual</a>
          </div>
        </header>

        <main className="flex-grow flex flex-col">
          {state === 'landing' && (
            <div className="flex flex-col items-start justify-center flex-grow max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h2 className="text-6xl sm:text-[140px] font-black tracking-tighter leading-[0.75] mb-12 uppercase select-none">
                FORMAL<br/>LOGIC.
              </h2>
              <p className="text-xl sm:text-2xl text-neutral-500 mb-16 max-w-2xl font-light leading-snug tracking-tight">
                An objective instrument for structural quantification. AXIOM deconstructs visual artifacts into raw geometric load and axial distribution.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <label className="group relative w-full sm:w-auto overflow-hidden bg-black text-white px-14 py-6 cursor-pointer border border-black transition-all">
                  <span className="relative z-10 text-sm mono uppercase tracking-[0.4em] font-medium">Mount Artifact</span>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                  <div className="absolute inset-0 bg-neutral-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                </label>
                <div className="text-[10px] mono uppercase text-neutral-300 tracking-[0.3em] animate-pulse hidden sm:block">
                  Awaiting Initial sequence
                </div>
              </div>
            </div>
          )}

          {state === 'upload' && imageSrc && (
            <div className="flex flex-col items-center justify-center flex-grow py-12 animate-in fade-in zoom-in-95 duration-700">
              <div className="relative w-full max-w-3xl border border-black p-2 bg-white mb-12 shadow-2xl overflow-hidden group">
                <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-black/20" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-black/20" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-black/20" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-black/20" />
                
                <div className="border border-neutral-100 p-12 sm:p-32 flex items-center justify-center bg-neutral-50/20 min-h-[450px] md:min-h-[600px] relative">
                  <img src={imageSrc} alt="Preview" className="max-w-full max-h-full object-contain grayscale opacity-80 mix-blend-multiply transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-full h-[1px] bg-black absolute" />
                    <div className="h-full w-[1px] bg-black absolute" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 text-[8px] mono text-neutral-300 tracking-widest animate-pulse">ARTIFACT_BUFFER_LOADED</div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl">
                <button onClick={reset} className="flex-1 px-10 py-5 text-xs mono uppercase border border-neutral-200 text-neutral-400 hover:text-black hover:border-black transition-all">Purge Buffer</button>
                <button onClick={startAnalysis} className="flex-[2] px-10 py-5 text-xs mono uppercase bg-black text-white hover:bg-neutral-800 transition-all shadow-xl active:scale-95 tracking-[0.2em] font-bold">Initiate Scan</button>
              </div>
            </div>
          )}

          {state === 'analyzing' && (
            <div className="flex flex-col items-center justify-center flex-grow w-full max-w-3xl mx-auto py-20 relative">
              <div className="relative w-full aspect-video bg-neutral-50 border border-black/5 mb-12 overflow-hidden flex items-center justify-center">
                {imageSrc && <img src={imageSrc} className="max-w-[50%] max-h-[50%] object-contain grayscale opacity-10 blur-[2px]" alt="Scanning" />}
                <div className="absolute inset-0 w-full h-[3px] bg-black shadow-[0_0_20px_rgba(0,0,0,0.6)] animate-[scan_1.5s_infinite]" />
              </div>
              <style>{`
                @keyframes scan {
                  0% { top: 0; }
                  100% { top: 100%; }
                }
              `}</style>
              <div className="w-full bg-black p-8 text-white mono text-[10px] leading-relaxed shadow-2xl relative">
                <div className="flex justify-between border-b border-white/10 pb-3 mb-6">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    CORE_ANALYSIS_IN_PROGRESS
                  </span>
                  <span className="opacity-40 tracking-tighter">NODE_ID: AX_902</span>
                </div>
                <div className="space-y-2">
                  {ANALYSIS_STEPS.map((step, idx) => (
                    <div key={idx} className={`${idx > analysisStep ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 flex justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className={idx === analysisStep ? 'text-white font-bold' : 'text-neutral-600'}>
                          {idx === analysisStep ? '>' : 'OK'}
                        </span>
                        <span className={idx === analysisStep ? 'text-white' : 'text-neutral-400'}>{step}</span>
                      </div>
                      {idx < analysisStep && <span className="text-green-500 text-[8px]">COMPLETE</span>}
                    </div>
                  ))}
                </div>
                <div className="mt-8 h-1.5 bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/60 w-full origin-left scale-x-0 animate-[progress_2s_linear_forwards]" />
                </div>
                <style>{`
                  @keyframes progress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                  }
                `}</style>
              </div>
            </div>
          )}

          {state === 'results' && metrics && analysis && imageSrc && (
            <div className="animate-in fade-in duration-1000">
              <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                <div className="flex flex-col">
                   <h2 className="text-8xl sm:text-[180px] font-black tracking-tighter leading-[0.75] uppercase italic">
                    {analysis.score}<span className="text-2xl not-italic ml-2 opacity-20">SHI</span>
                   </h2>
                   <span className="text-xs mono uppercase tracking-[0.5em] text-neutral-400 mt-4">Structural Harmony Index / Structural Evaluation</span>
                </div>
                <div className="flex flex-col text-right gap-2">
                  <span className="text-[10px] mono uppercase text-neutral-300 tracking-widest">Diagnostic ID</span>
                  <span className="text-sm mono font-bold bg-neutral-100 px-4 py-2">AX-{Math.floor(Math.random() * 99999)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
                <div className="bg-white border border-black/5 p-8 flex flex-col aspect-square relative shadow-sm">
                  <span className="absolute top-6 left-6 text-[9px] mono uppercase text-neutral-300 tracking-widest">Fig.01 / Euclidean Mapping</span>
                  <div className="flex-grow flex items-center justify-center">
                    <StructuralOverlay metrics={metrics} imageSrc={imageSrc} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                   <div className="bg-neutral-900 text-white p-10 flex flex-col justify-between">
                      <h3 className="text-[11px] mono uppercase tracking-[0.5em] text-neutral-500 border-b border-white/10 pb-4 mb-8">Volumetric Data</h3>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-[11px] mono uppercase tracking-widest">
                        <div className="flex flex-col gap-2">
                          <span className="text-neutral-500">Symmetry_V</span>
                          <span className="text-xl font-bold">{metrics.symmetry_vertical}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-neutral-500">Symmetry_H</span>
                          <span className="text-xl font-bold">{metrics.symmetry_horizontal}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-neutral-500">Pixel_Density</span>
                          <span className="text-xl font-bold">{metrics.density.toFixed(2)}%</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-neutral-500">Complexity</span>
                          <span className="text-xl font-bold">{metrics.complexity_index.toFixed(4)}</span>
                        </div>
                      </div>
                   </div>
                   <div className="bg-white border border-black p-10 flex flex-col h-full">
                      <h3 className="text-[11px] mono uppercase tracking-[0.5em] text-neutral-300 border-b border-neutral-100 pb-4 mb-8">Corrective Protocol</h3>
                      <ul className="space-y-6">
                        {analysis.remedial_actions.map((action, i) => (
                          <li key={i} className="flex gap-6 items-start">
                            <span className="text-2xl font-black text-neutral-100 italic">0{i+1}</span>
                            <p className="text-sm leading-relaxed text-neutral-800">{action}</p>
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t-[4px] border-black pt-16 mb-24">
                <div className="lg:col-span-4 flex flex-col gap-12">
                   <section>
                      <h4 className="text-[10px] mono uppercase tracking-[0.4em] text-neutral-400 mb-6">Market Grounding</h4>
                      <p className="text-base leading-relaxed text-neutral-600 italic">"{analysis.market_context}"</p>
                      {analysis.groundingUrls && analysis.groundingUrls.length > 0 && (
                        <div className="mt-8 space-y-2">
                          {analysis.groundingUrls.map((link, i) => (
                            <a key={i} href={link.uri} target="_blank" className="block text-[10px] mono uppercase truncate hover:text-black transition-colors underline decoration-neutral-200">
                              {link.title || link.uri}
                            </a>
                          ))}
                        </div>
                      )}
                   </section>
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-16">
                   <section>
                      <h4 className="text-[10px] mono uppercase tracking-[0.4em] text-neutral-400 border-b border-neutral-100 pb-4 mb-8">01 / Morphological Integrity</h4>
                      <p className="text-lg leading-relaxed font-light text-neutral-900">{analysis.structural_summary}</p>
                   </section>
                   <section>
                      <h4 className="text-[10px] mono uppercase tracking-[0.4em] text-neutral-400 border-b border-neutral-100 pb-4 mb-8">02 / Volumetric Bias</h4>
                      <p className="text-lg leading-relaxed font-light text-neutral-900">{analysis.balance_analysis}</p>
                   </section>
                   <section>
                      <h4 className="text-[10px] mono uppercase tracking-[0.4em] text-neutral-400 border-b border-neutral-100 pb-4 mb-8">03 / Axial Tension</h4>
                      <p className="text-lg leading-relaxed font-light text-neutral-900">{analysis.alignment_analysis}</p>
                   </section>
                   <section>
                      <h4 className="text-[10px] mono uppercase tracking-[0.4em] text-neutral-400 border-b border-neutral-100 pb-4 mb-8">04 / Geometric Logic</h4>
                      <p className="text-lg leading-relaxed font-light text-neutral-900">{analysis.geometry_analysis}</p>
                   </section>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between border-t border-black py-12 gap-8 mb-20">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <button 
                    onClick={reset}
                    className="flex-1 md:flex-none px-12 py-6 text-xs mono uppercase bg-white text-black border border-black hover:bg-neutral-50 transition-all tracking-[0.2em] font-bold"
                  >
                    Mount New Artifact
                  </button>
                  <button 
                    onClick={generatePDF}
                    className="flex-1 md:flex-none px-12 py-6 text-xs mono uppercase bg-black text-white hover:bg-neutral-800 transition-all shadow-xl tracking-[0.2em] font-bold"
                  >
                    Download PDF Report
                  </button>
                </div>
                <span className="text-[9px] mono text-neutral-400 uppercase tracking-widest text-center md:text-right">
                  System AXIOM / 2026.11<br/>
                  CALC_METHOD: Euclidean_Pixel_Centroid_V2
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
