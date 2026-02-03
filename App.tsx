
import React, { useState, useEffect, useRef } from 'react';
import { getLogoMetrics } from './utils/analysis';
import { analyzeLogoStructure } from './services/gemini';
import { LogoMetrics, AnalysisResponse, AppState } from './types';
import StructuralOverlay from './components/StructuralOverlay';
import { jsPDF } from 'jspdf';

interface ArchivedAnalysis {
  id: string;
  timestamp: number;
  imageSrc: string;
  score: number;
  metrics: LogoMetrics;
  analysis: AnalysisResponse;
}

const ANALYSIS_STEPS = [
  "Initializing AXIOM Core...",
  "Isolating Volumetric Centroid...",
  "Mapping Morphological Load...",
  "Quantifying Axial Deviation...",
  "Grounding Market Patterns...",
  "Generating Structural Protocol..."
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('landing');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<LogoMetrics | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showArchive, setShowArchive] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [archive, setArchive] = useState<ArchivedAnalysis[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('axiom_archive_v1');
    if (saved) {
      try {
        setArchive(JSON.parse(saved));
      } catch (e) {
        console.error("Archive data failure.");
      }
    }
  }, []);

  useEffect(() => {
    let interval: number;
    if (state === 'analyzing') {
      setAnalysisStep(0);
      interval = window.setInterval(() => {
        setAnalysisStep(prev => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
      }, 400);
    }
    return () => clearInterval(interval);
  }, [state]);

  const saveToArchive = (newEntry: ArchivedAnalysis) => {
    const updated = [newEntry, ...archive].slice(0, 25);
    setArchive(updated);
    localStorage.setItem('axiom_archive_v1', JSON.stringify(updated));
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('FORMAT_ERROR: Analysis requires high-fidelity image artifacts.');
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
      const extractedMetrics = await getLogoMetrics(imageSrc);
      setMetrics(extractedMetrics);
      const aiResponse = await analyzeLogoStructure(extractedMetrics);
      setAnalysis(aiResponse);
      
      const newEntry: ArchivedAnalysis = {
        id: `AX-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
        timestamp: Date.now(),
        imageSrc,
        score: aiResponse.score,
        metrics: extractedMetrics,
        analysis: aiResponse
      };
      saveToArchive(newEntry);
      
      setState('results');
    } catch (err) {
      setError('SYSTEM_FAULT: Diagnostic connection timeout.');
      setState('upload');
    }
  };

  const loadFromArchive = (item: ArchivedAnalysis) => {
    setImageSrc(item.imageSrc);
    setMetrics(item.metrics);
    setAnalysis(item.analysis);
    setState('results');
    setShowArchive(false);
  };

  const generatePDF = () => {
    if (!analysis || !metrics) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("AXIOM STRUCTURAL REPORT", 20, y);
    y += 8;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`DATE: ${new Date().toLocaleString()}`, 20, y);
    doc.text(`SYSTEM: AXIOM CORE v2.1`, pageWidth - 50, y);
    y += 10;
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.line(20, y, pageWidth - 20, y);
    y += 12;
    doc.setFontSize(8);
    doc.text("STRUCTURAL HARMONY INDEX (SHI)", 20, y);
    y += 10;
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.text(String(analysis.score), 20, y);
    y += 15;
    const sections = [
      { title: "MORPHOLOGICAL INTEGRITY", text: analysis.structural_summary },
      { title: "VOLUMETRIC LOGIC", text: analysis.balance_analysis },
      { title: "GEOMETRIC TENSION", text: analysis.geometry_analysis },
      { title: "AXIAL CRITIQUE", text: analysis.alignment_analysis },
      { title: "MARKET CONTEXT", text: analysis.market_context }
    ];
    doc.setFontSize(8);
    sections.forEach(s => {
      doc.setFont("helvetica", "bold");
      doc.text(s.title, 20, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(s.text || "", pageWidth - 40);
      doc.text(lines, 20, y);
      y += (lines.length * 4) + 8;
      if (y > 280) { doc.addPage(); y = 20; }
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
      className={`min-h-screen bg-[#fafafa] text-black transition-all duration-700 ease-in-out ${isDragging ? 'bg-[#f0f0f0]' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) processFile(file); }}
    >
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] select-none" 
           style={{ backgroundImage: 'linear-gradient(#000 0.5px, transparent 0.5px), linear-gradient(90deg, #000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} 
      />

      {showManual && (
        <div className="fixed inset-0 z-[100] bg-white/98 backdrop-blur-2xl animate-in fade-in duration-300 overflow-y-auto px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setShowManual(false)} className="fixed top-6 right-6 text-[8px] mono border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-all uppercase font-bold tracking-[0.1em] bg-white">Close_Protocol</button>
            <h2 className="text-3xl md:text-5xl font-black mb-8 heading-archivo uppercase tracking-tighter border-b-2 border-black pb-4">Protocol<br/>Manual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section>
                <h3 className="mono text-[8px] text-neutral-400 mb-2 tracking-[0.4em] uppercase font-bold">01 / Axial Tension</h3>
                <p className="text-sm font-light leading-relaxed mb-2">Measurement of the offset between perceptual centroid and origin.</p>
                <p className="text-neutral-500 text-[9px] leading-relaxed">High tension denotes asymmetric bias or structural instability.</p>
              </section>
              <section>
                <h3 className="mono text-[8px] text-neutral-400 mb-2 tracking-[0.4em] uppercase font-bold">02 / Euclidean Symmetry</h3>
                <p className="text-sm font-light leading-relaxed mb-2">Calculation of bilateral pixel density across planes.</p>
                <p className="text-neutral-500 text-[9px] leading-relaxed">Identifies balance relative to horizontal and vertical axes.</p>
              </section>
              <section>
                <h3 className="mono text-[8px] text-neutral-400 mb-2 tracking-[0.4em] uppercase font-bold">03 / Morphological Density</h3>
                <p className="text-sm font-light leading-relaxed mb-2">Ratio of occupied pixel data within constraint.</p>
                <p className="text-neutral-500 text-[9px] leading-relaxed">Dictates scalability. Low density may fail at micro-scales.</p>
              </section>
              <section>
                <h3 className="mono text-[8px] text-neutral-400 mb-2 tracking-[0.4em] uppercase font-bold">04 / Market Grounding</h3>
                <p className="text-sm font-light leading-relaxed mb-2">Algorithmic indexing against industrial silhouettes.</p>
                <p className="text-neutral-500 text-[9px] leading-relaxed">Assesses alignment with contemporary standards.</p>
              </section>
            </div>
          </div>
        </div>
      )}

      {showArchive && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/5 backdrop-blur-sm" onClick={() => setShowArchive(false)} />
          <div className="relative w-full max-w-[280px] bg-white border-l border-black shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
              <h3 className="heading-archivo font-black text-[10px] uppercase tracking-widest italic">Archive_Index</h3>
              <button onClick={() => setShowArchive(false)} className="mono text-[8px] hover:text-black transition-colors uppercase font-bold tracking-widest border border-black/10 px-2 py-1">Exit</button>
            </div>
            <div className="flex-grow overflow-y-auto p-3 space-y-2 no-scrollbar">
              {archive.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-300 mono text-[8px] uppercase tracking-[0.4em] gap-2">
                  <div className="w-5 h-5 border border-dashed border-neutral-200"></div>
                  Records empty
                </div>
              ) : (
                archive.map((item) => (
                  <button 
                    key={item.timestamp}
                    onClick={() => loadFromArchive(item)}
                    className="w-full text-left bg-white p-3 border border-neutral-100 hover:border-black transition-all group flex items-center gap-4 shadow-sm"
                  >
                    <div className="w-8 h-8 bg-neutral-50 border border-neutral-100 flex items-center justify-center p-1 group-hover:bg-white transition-colors">
                      <img src={item.imageSrc} className="max-w-full max-h-full grayscale group-hover:grayscale-0 transition-all duration-500" alt="Archive Artifact" />
                    </div>
                    <div>
                      <div className="mono text-[7px] text-neutral-400 mb-0.5 font-bold">{new Date(item.timestamp).toLocaleDateString()}</div>
                      <div className="heading-archivo font-black text-sm uppercase italic leading-none">{item.score} <span className="text-[7px] opacity-20 not-italic">SHI</span></div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6 md:py-8 flex flex-col min-h-screen">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-baseline border-b border-black pb-4 mb-10 md:mb-12 gap-4">
          <div className="flex flex-col cursor-pointer group" onClick={reset}>
            <h1 className="text-base font-black tracking-tighter uppercase leading-none heading-archivo group-hover:italic transition-all">
              AXIOM
            </h1>
            <span className="text-[7px] mono uppercase text-neutral-400 tracking-[0.4em] mt-1 font-bold">Structural Intelligence</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-[8px] mono uppercase font-black">
            <button onClick={() => setShowArchive(true)} className="flex items-center gap-1.5 hover:text-black text-neutral-400 transition-colors">
              <span className="w-1 h-1 bg-neutral-200 rounded-full"></span>
              Archive
            </button>
            <button onClick={() => setShowManual(true)} className="flex items-center gap-1.5 hover:text-black text-neutral-400 transition-colors">
              <span className="w-1 h-1 bg-neutral-200 rounded-full"></span>
              Protocol
            </button>
            <span className="flex items-center gap-1.5 text-green-600 ml-auto md:ml-0">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
              Live
            </span>
          </nav>
        </header>

        <main className="flex-grow flex flex-col">
          {state === 'landing' && (
            <div className="flex flex-col items-start justify-center flex-grow max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h2 className="text-4xl sm:text-[60px] md:text-[80px] font-black tracking-tighter leading-[0.75] mb-6 uppercase select-none heading-syne italic">
                FORMAL<br/>LOGIC.
              </h2>
              <p className="text-sm md:text-base text-neutral-400 mb-8 max-w-lg font-light leading-relaxed tracking-tight">
                An objective instrument for structural quantification. <span className="text-black font-medium">AXIOM deconstructs visual artifacts</span> into raw geometric load and axial distribution indices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                <label className="group relative w-full sm:w-auto overflow-hidden bg-black text-white px-6 py-3.5 cursor-pointer border border-black transition-all hover:shadow-[6px_6px_0_rgba(0,0,0,0.05)]">
                  <span className="relative z-10 text-[9px] mono uppercase tracking-[0.3em] font-black">Mount Artifact</span>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                  <div className="absolute inset-0 bg-neutral-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                </label>
                <div className="text-[7px] mono uppercase text-neutral-300 tracking-[0.2em] font-black animate-pulse hidden sm:block">
                  Awaiting Input
                </div>
              </div>
            </div>
          )}

          {state === 'upload' && imageSrc && (
            <div className="flex flex-col items-center justify-center flex-grow py-6 animate-in fade-in zoom-in-95 duration-700">
              <div className="relative w-full max-w-xl border border-black p-2 bg-white mb-8 shadow-[8px_8px_0_rgba(0,0,0,0.01)] overflow-hidden group">
                <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-black/10" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-black/10" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-black/10" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-black/10" />
                
                <div className="border border-neutral-100 p-8 md:p-16 flex items-center justify-center bg-neutral-50/20 min-h-[300px] md:min-h-[450px] relative">
                  <img src={imageSrc} alt="Preview" className="max-w-full max-h-full object-contain grayscale mix-blend-multiply transition-all duration-1000 group-hover:scale-[1.01]" />
                </div>
                <div className="absolute bottom-2 right-2 text-[6px] mono text-neutral-400 tracking-[0.1em] font-black uppercase">Buffer_Status: Artifact_Ready</div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xl">
                <button onClick={reset} className="flex-1 px-4 py-2.5 text-[8px] mono uppercase border border-neutral-100 text-neutral-400 hover:text-black hover:border-black transition-all font-black tracking-widest">Purge</button>
                <button onClick={startAnalysis} className="flex-[2] px-4 py-2.5 text-[8px] mono uppercase bg-black text-white hover:bg-neutral-800 transition-all shadow-lg active:scale-[0.98] tracking-[0.2em] font-black">Execute Scan</button>
              </div>
            </div>
          )}

          {state === 'analyzing' && (
            <div className="flex flex-col items-center justify-center flex-grow w-full max-w-md mx-auto py-12 animate-in fade-in duration-500">
              <div className="relative w-full aspect-video bg-neutral-50 border border-black/5 mb-6 overflow-hidden flex items-center justify-center shadow-inner">
                {imageSrc && <img src={imageSrc} className="max-w-[25%] max-h-[25%] object-contain grayscale opacity-10 blur-[2px]" alt="Scanning" />}
                <div className="absolute inset-0 w-full h-[1.5px] bg-black shadow-[0_0_10px_rgba(0,0,0,0.4)] animate-[mri-scan_2s_infinite_ease-in-out]" />
              </div>
              <div className="w-full bg-black p-5 text-white mono text-[7px] leading-loose shadow-xl border-l-[4px] border-neutral-800">
                <div className="flex justify-between border-b border-white/10 pb-2 mb-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
                    CORE_ACTIVE
                  </span>
                  <span className="opacity-20 tracking-widest font-black uppercase">v2.1</span>
                </div>
                <div className="space-y-1.5">
                  {ANALYSIS_STEPS.map((step, idx) => (
                    <div key={idx} className={`${idx > analysisStep ? 'opacity-0' : 'opacity-100'} transition-all duration-300 flex justify-between items-center`}>
                      <div className="flex items-center gap-1.5">
                        <span className={idx === analysisStep ? 'text-white font-black' : 'text-neutral-700'}>
                          {idx === analysisStep ? '→' : 'OK'}
                        </span>
                        <span className={idx === analysisStep ? 'text-white font-medium' : 'text-neutral-500'}>{step}</span>
                      </div>
                      {idx < analysisStep && <span className="text-green-500 font-black tracking-widest uppercase text-[5px]">READY</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {state === 'results' && metrics && analysis && imageSrc && (
            <div className="animate-in fade-in duration-1000 pb-12">
              <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
                <div className="flex flex-col">
                   <h2 className="text-[50px] sm:text-[80px] md:text-[110px] font-black tracking-tighter leading-[0.7] uppercase italic heading-archivo select-none">
                    {analysis.score}<span className="text-xs not-italic ml-2 opacity-10 font-bold">SHI</span>
                   </h2>
                   <span className="text-[7px] mono uppercase tracking-[0.4em] text-neutral-400 mt-2 font-black">Harmony Index / Structural Evaluation</span>
                </div>
                <div className="flex flex-col text-right gap-1 border-r border-black pr-3">
                  <span className="text-[6px] mono uppercase text-neutral-300 tracking-[0.3em] font-black">DATA_REF</span>
                  <span className="text-[10px] mono font-black bg-neutral-100 px-2 py-1">AX-{Math.floor(Math.random() * 99999).toString().padStart(5, '0')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
                <div className="bg-white border border-black p-3 flex flex-col aspect-square relative">
                  <span className="absolute top-3 left-3 text-[6px] mono uppercase text-neutral-300 tracking-[0.3em] font-black bg-white px-1">Fig.01 / Euclidean Trace</span>
                  <div className="flex-grow flex items-center justify-center">
                    <StructuralOverlay metrics={metrics} imageSrc={imageSrc} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5">
                   <div className="bg-black text-white p-5 flex flex-col justify-between shadow-lg">
                      <h3 className="text-[8px] mono uppercase tracking-[0.4em] text-neutral-600 border-b border-white/10 pb-2 mb-4 font-black">Forensic Telemetry</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[8px] mono uppercase tracking-[0.2em]">
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 font-bold">Symmetry_V</span>
                          <span className="text-base font-black italic">{metrics.symmetry_vertical}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 font-bold">Symmetry_H</span>
                          <span className="text-base font-black italic">{metrics.symmetry_horizontal}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 font-bold">Density</span>
                          <span className="text-base font-black italic">{metrics.density.toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-neutral-500 font-bold">Complex_Ix</span>
                          <span className="text-base font-black italic">{metrics.complexity_index.toFixed(3)}</span>
                        </div>
                      </div>
                   </div>
                   <div className="bg-white border border-black p-5 flex flex-col h-full shadow-[6px_6px_0_rgba(0,0,0,0.01)]">
                      <h3 className="text-[8px] mono uppercase tracking-[0.4em] text-neutral-300 border-b border-neutral-100 pb-2 mb-4 font-black">Structural Protocol</h3>
                      <ul className="space-y-2.5">
                        {analysis.remedial_actions.map((action, i) => (
                          <li key={i} className="flex gap-3 items-start group">
                            <span className="text-sm font-black text-neutral-100 italic heading-archivo group-hover:text-black transition-colors duration-500">0{i+1}</span>
                            <p className="text-[10px] leading-relaxed text-neutral-800 font-light">{action}</p>
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-black pt-6 mb-12">
                <div className="lg:col-span-5 flex flex-col gap-6">
                   <section>
                      <h4 className="text-[7px] mono uppercase tracking-[0.5em] text-neutral-400 mb-4 font-black">Market Context</h4>
                      <p className="text-sm leading-relaxed text-neutral-600 italic font-light">"{analysis.market_context}"</p>
                      {analysis.groundingUrls && analysis.groundingUrls.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5">
                          <span className="text-[6px] mono uppercase text-neutral-300 tracking-widest font-bold block mb-1">Citations:</span>
                          {analysis.groundingUrls.map((link, i) => (
                            <a 
                              key={i} href={link.uri} target="_blank" rel="noopener noreferrer" 
                              className="group flex items-center gap-1.5 text-[8px] mono uppercase truncate hover:text-black text-neutral-400 transition-all font-bold"
                            >
                              <span className="text-black">↗</span>
                              <span className="underline decoration-neutral-100 underline-offset-4 group-hover:decoration-black">{link.title || 'Diagnostic'}</span>
                            </a>
                          ))}
                        </div>
                      )}
                   </section>
                </div>
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <section>
                      <h4 className="text-[7px] mono uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100 pb-2 mb-3 font-black">01 / Morphological Integrity</h4>
                      <p className="text-[11px] leading-relaxed font-light text-neutral-900">{analysis.structural_summary}</p>
                   </section>
                   <section>
                      <h4 className="text-[7px] mono uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100 pb-2 mb-3 font-black">02 / Volumetric Bias</h4>
                      <p className="text-[11px] leading-relaxed font-light text-neutral-900">{analysis.balance_analysis}</p>
                   </section>
                   <section>
                      <h4 className="text-[7px] mono uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100 pb-2 mb-3 font-black">03 / Axial Tension</h4>
                      <p className="text-[11px] leading-relaxed font-light text-neutral-900">{analysis.alignment_analysis}</p>
                   </section>
                   <section>
                      <h4 className="text-[7px] mono uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100 pb-2 mb-3 font-black">04 / Geometric Logic</h4>
                      <p className="text-[11px] leading-relaxed font-light text-neutral-900">{analysis.geometry_analysis}</p>
                   </section>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between border-t border-black py-6 gap-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button 
                    onClick={reset}
                    className="flex-1 md:flex-none px-6 py-3 text-[8px] mono uppercase bg-white text-black border border-black hover:bg-neutral-50 transition-all tracking-[0.3em] font-black shadow-[4px_4px_0_rgba(0,0,0,0.02)] active:translate-y-0.5 active:shadow-none"
                  >
                    Reset_Scan
                  </button>
                  <button 
                    onClick={generatePDF}
                    className="flex-1 md:flex-none px-6 py-3 text-[8px] mono uppercase bg-black text-white hover:bg-neutral-800 transition-all shadow-lg tracking-[0.3em] font-black active:translate-y-0.5"
                  >
                    Export_PDF
                  </button>
                </div>
                <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
                  <span className="text-[6px] mono text-neutral-400 uppercase tracking-widest leading-loose font-bold">
                    AXIOM — Structural Intelligence<br/>
                    Diagnostic Kernel: v2.1
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-4 py-2 mono text-[7px] uppercase tracking-widest font-black shadow-2xl animate-in slide-in-from-bottom-8 duration-300 flex items-center gap-3">
           <span>{error}</span>
           <button onClick={() => setError(null)} className="bg-white/20 px-1.5 py-0.5 hover:bg-white/40">DISMISS</button>
        </div>
      )}
    </div>
  );
};

export default App;
