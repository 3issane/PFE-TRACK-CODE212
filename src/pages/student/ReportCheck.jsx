import React, { useState, useEffect } from 'react';
import { authHeader } from '@/auth';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// Removed Input & Textarea (replaced by drag & drop)
import { Button } from '@/components/ui/button';
import { Dropzone, DropzoneEmptyState, DropzoneContent } from '@/components/ui/shadcn-io/dropzone';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, FileText } from 'lucide-react';

/*
  Client-side heuristic checks + backend Gemini model scoring.
  Four standards:
   1. Orthography (basic spelling heuristic)
   2. Clarity (sentence length & passive voice hints)
   3. Structure (sections count: intro/method/results/conclusion keywords)
   4. Originality (diversity heuristic + AI evaluation)
*/

const standardsMeta = [
  { key: 'orthography', label: 'Orthography', weight: 0.20 },
  { key: 'clarity', label: 'Clarity', weight: 0.20 },
  { key: 'structure', label: 'Structure', weight: 0.20 },
  { key: 'plagiarism', label: 'Originality', weight: 0.20 },
  { key: 'completeness', label: 'Completeness', weight: 0.20 },
];

function analyzeText(raw) {
  const text = raw || '';
  const words = text.split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();

  // Heuristic thresholds
  const MIN_WORDS = 2500; // below this counts as incomplete
  const TARGET_WORDS = 6000; // typical mid-size report
  const REQUIRED_SECTIONS = ['introduction','literature','method','methodology','results','discussion','conclusion'];
  const SPECIFICATION_KEYWORDS = ['cahier des charges','requirement','exigence','spécification','specification fonctionnelle','analyse des besoins'];

  // 1. Orthography
  let miss = 0;
  for (const w of words) {
    if (/([a-z])\1{3,}/i.test(w) || /[a-z]\d+[a-z]/i.test(w)) miss++;
  }
  let orthScore = words.length ? Math.max(0, 100 - (miss / words.length) * 100) : 0;

  // 2. Clarity
  const sentences = text.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
  const avgLen = sentences.length ? words.length / sentences.length : 0;
  let clarity = 100;
  if (avgLen > 28) clarity -= (avgLen - 28) * 2.5;
  if (avgLen > 40) clarity -= 10; // heavy penalty extremely long sentences
  if (avgLen < 8) clarity -= (8 - avgLen) * 4;
  if (/\b(is|was|were|be|been|being)\b\s+\w+ed\b/i.test(text)) clarity -= 7; // passive voice hint
  const clarityScore = Math.max(0, Math.min(100, clarity));

  // 3. Structure
  let sectionHits = 0;
  for (const s of REQUIRED_SECTIONS) {
    if (lower.includes(s)) sectionHits++;
  }
  let structureScore = (sectionHits / REQUIRED_SECTIONS.length) * 100;

  // 4. Originality (lexical diversity) with stronger penalty for very low diversity
  const uniq = new Set(words.map(w=>w.toLowerCase().replace(/[^a-z]/g,''))).size;
  const diversity = words.length ? uniq / words.length : 0;
  let plagiarismScore = diversity * 125; // slightly higher scaling
  if (diversity < 0.35) plagiarismScore -= 25;
  plagiarismScore = Math.max(0, Math.min(100, plagiarismScore));

  // 5. Completeness: based on word count & section coverage
  const lengthRatio = Math.min(1, words.length / TARGET_WORDS);
  // Base completeness from word count (60%) + section coverage (40%)
  let completenessScore = (lengthRatio * 60) + ((sectionHits / REQUIRED_SECTIONS.length) * 40);
  if (words.length < MIN_WORDS) {
    // cap if insufficient content
    completenessScore = Math.min(completenessScore, Math.round((words.length / MIN_WORDS) * 40));
  }

  // Detect possible specification (not a narrative report) and cap structure/completeness
  const isSpecification = SPECIFICATION_KEYWORDS.some(k => lower.includes(k));
  if (isSpecification) {
    structureScore = Math.min(structureScore, 30);
    completenessScore = Math.min(completenessScore, 35);
  }

  const details = {
    orthography: { score: Math.round(orthScore), issues: miss, note: miss? `${miss} potential misspellings detected.`:'No obvious spelling anomalies.' },
    clarity: { score: Math.round(clarityScore), avgSentenceLength: avgLen.toFixed(1), note: `Avg sentence length ${avgLen.toFixed(1)}.` },
    structure: { score: Math.round(structureScore), found: sectionHits, note: `Detected ${sectionHits}/${REQUIRED_SECTIONS.length} target sections.` },
    plagiarism: { score: Math.round(plagiarismScore), diversity: diversity.toFixed(2), note: `Lexical diversity ${diversity.toFixed(2)}.` },
    completeness: { score: Math.round(completenessScore), words: words.length, note: words.length < MIN_WORDS ? `Insufficient length (${words.length}/${MIN_WORDS} words).` : `Words: ${words.length}` }
  };

  // Weighted overall
  let overall = standardsMeta.reduce((acc,s)=>acc + (details[s.key]?.score || 0) * s.weight, 0);

  // Hard cap if content insufficient
  if (words.length < MIN_WORDS) {
    overall = Math.min(overall, 55); // never pass mid score if very short
  }
  if (isSpecification) {
    overall = Math.min(overall, 60); // specification doc not a full report
  }

  const flags = [];
  if (words.length < MIN_WORDS) flags.push('INSUFFICIENT_CONTENT');
  if (isSpecification) flags.push('POSSIBLE_SPECIFICATION_DOCUMENT');
  if (sectionHits < 3) flags.push('MISSING_CORE_SECTIONS');
  if (diversity < 0.4) flags.push('LOW_DIVERSITY');

  return { details, overall: Math.round(overall), flags };
}

export default function StudentReportCheck() {
  const [text,setText] = useState(''); // extracted file text
  const [fileName,setFileName] = useState('');
  const [droppedFiles,setDroppedFiles] = useState([]);
  const [loading,setLoading] = useState(false);
  const [result,setResult] = useState(null);
  const [aiExtra,setAiExtra] = useState(null);
  const [parseError,setParseError] = useState('');
  const [parsing,setParsing] = useState(false);
  const [parsingProgress,setParsingProgress] = useState(null); // 0-100 or null
  const [cancelParse,setCancelParse] = useState(false);
  const [fastMode,setFastMode] = useState(true); // approximate extraction for speed
  const MAX_SIZE_MB = 8; // soft limit

  // Deterministic loader for pdf.js (legacy ESM build). Try to enable worker for speed; fallback to no-worker.
  const loadPdfJs = async () => {
    if (window.__pdfjsLegacy) return window.__pdfjsLegacy;
    try {
      const lib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      // Attempt to load proper worker URL (Vite ?url loader). If it fails, fall back to inline dummy.
      if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
        try {
          const workerMod = await import('pdfjs-dist/legacy/build/pdf.worker.mjs?url');
          if (workerMod?.default) {
            lib.GlobalWorkerOptions.workerSrc = workerMod.default;
          } else {
            const blob = new Blob(['/* pdf.js dummy worker */'], { type: 'text/javascript' });
            lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
          }
        } catch {
          try {
            const blob = new Blob(['/* pdf.js dummy worker fallback */'], { type: 'text/javascript' });
            lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
          } catch {}
        }
      }
      window.__pdfjsLegacy = lib;
      return lib;
    } catch (e) {
      throw new Error('pdf.js module not found (pdfjs-dist). Ensure dependency is installed.');
    }
  };

  // Preload pdf.js on mount so first user interaction is faster
  useEffect(() => { loadPdfJs().catch(()=>{}); }, []);

  const handleFile = async (f) => {
    if(!f) return; setFileName(f.name); setParseError(''); setParsing(true); setText('');
    setParsingProgress(null); setCancelParse(false);
    const nameLower = f.name.toLowerCase();
    try {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(`File larger than ${MAX_SIZE_MB} MB not supported here.`);
      }
      if (nameLower.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = e => { setText(e.target.result); setParsing(false); };
        reader.readAsText(f);
      } else if (nameLower.endsWith('.pdf')) {
        let collected = [];
        try {
          const pdfjsLib = await loadPdfJs();
          const arrayBuf = await f.arrayBuffer();
          // Dynamic timeout scaled by file size (baseline 10s + up to 20s extra)
          const sizeMB = f.size / (1024*1024);
          const initialTimeout = 10000 + Math.min(20000, Math.round(sizeMB * 1500));
          let pdf;
          try {
            pdf = await Promise.race([
              pdfjsLib.getDocument({ data: arrayBuf }).promise,
              new Promise((_,rej)=>setTimeout(()=>rej(new Error('Initial load timeout')), initialTimeout))
            ]);
          } catch (e) {
            if (e.message === 'Initial load timeout') {
              // Retry once without race (may still succeed, just slow)
              pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
              setParseError('PDF loaded slowly; continuing with partial time budget.');
            } else throw e;
          }
          const pageLimit = fastMode ? Math.min(pdf.numPages, 30) : pdf.numPages;
          const loopBudget = (fastMode ? 12000 : 30000) + Math.min(20000, sizeMB * 2000); // ms
          const loopStart = performance.now();
          for (let p = 1; p <= pageLimit; p++) {
            if (cancelParse) { setParseError('Parsing cancelled'); break; }
            if (performance.now() - loopStart > loopBudget) { setParseError('Time budget reached; partial extraction shown.'); break; }
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            collected.push(content.items.map(it=>('str' in it? it.str : '')).join(' '));
            setParsingProgress(Math.round((p / pageLimit) * 100));
            if (p % 3 === 0) await new Promise(r=>setTimeout(r,0));
          }
        } catch (e) {
          if (!cancelParse) setParseError(e.message || 'Failed to parse PDF');
        } finally {
          const fullText = collected.join('\n');
          if (fullText.trim()) setText(fullText.trim());
          setParsing(false);
        }
      } else if (nameLower.endsWith('.docx')) {
        // DOCX parsing: unzip & extract document.xml
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(await f.arrayBuffer());
        const docFile = zip.file('word/document.xml');
        if (!docFile) throw new Error('document.xml not found');
        const xml = await docFile.async('text');
        let textOut;
        if (fastMode || xml.length > 800000) {
          // Fast path: simple stripping; preserve paragraph boundaries
            textOut = xml
              .replace(/<w:p[^>]*>/g, '\n')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
        } else {
          const { XMLParser } = await import('fast-xml-parser');
          const parser = new XMLParser({ ignoreAttributes: true, preserveOrder: true });
          const parsed = parser.parse(xml);
          const collectText = (nodes, acc=[]) => { for (const n of nodes) { if (typeof n === 'object') { const keys = Object.keys(n); for (const k of keys) { const v = n[k]; if (Array.isArray(v)) collectText(v, acc); else if (typeof v === 'string') acc.push(v); else if (typeof v === 'object') collectText([v], acc); } } else if (typeof n === 'string') acc.push(n);} return acc; };
          const rawPieces = collectText(parsed).join(' ');
          textOut = (rawPieces.trim() || xml.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
        }
        setText(textOut);
        setParsing(false);
      } else {
        setParseError('Unsupported file type. Use .txt, .pdf or .docx');
        setParsing(false);
      }
    } catch (e) {
      console.error(e);
      setParseError(e.message || 'Failed to parse file.');
      setParsing(false);
    }
  };

  const runChecks = async () => {
    setLoading(true); setResult(null); setAiExtra(null);
    try {
      const base = analyzeText(text);
      setResult(base);
      // Always attempt backend Gemini analysis
      if (text.trim().length > 0) {
        try {
          const resp = await fetch('http://localhost:8080/api/ai/gemini/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({ text })
          });
          const data = await resp.json();
          if (!resp.ok) {
            setAiExtra({ error: data.error || 'Gemini request failed', status: data.status });
          } else {
            setAiExtra(data);
          }
        } catch (e) {
          setAiExtra({ error: 'Gemini network error' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar><AppSidebar /></Sidebar>
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col gap-6 p-4 pt-0'>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>AI Report Check</h1>
            <p className='text-muted-foreground text-sm'>Upload or paste your report. Local heuristics + backend Gemini AI scoring.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Provide your report (plain text).</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label>Report File (.txt, .pdf, .docx) – Drag & Drop</Label>
                <Dropzone
                  accept={{
                    'application/pdf': ['.pdf'],
                    'text/plain': ['.txt'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                  }}
                  maxFiles={1}
                  onDrop={(accepted) => {
                    if (accepted && accepted[0]) {
                      setDroppedFiles(accepted);
                      handleFile(accepted[0]);
                    }
                  }}
                  src={droppedFiles}
                >
                  {droppedFiles.length === 0 ? (
                    <div className='flex flex-col items-center justify-center w-full h-full py-14 text-center gap-4'>
                      <div className='flex items-center justify-center gap-3'>
                        <UploadCloud className='h-12 w-12 text-primary/70' />
                        <FileText className='h-10 w-10 text-muted-foreground/70' />
                      </div>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Drag & Drop your report here</p>
                        <p className='text-xs text-muted-foreground'>or click to browse (.pdf, .docx, .txt)</p>
                      </div>
                    </div>
                  ) : (
                    <DropzoneContent />
                  )}
                </Dropzone>
                {fileName && <p className='text-xs text-muted-foreground'>Loaded: {fileName}{parsing && ' · parsing...'}</p>}
                {parseError && <p className='text-xs text-red-500'>{parseError}</p>}
                {parsing && parsingProgress != null && (
                  <div className='mt-1 space-y-1'>
                    <Progress value={parsingProgress} />
                    <p className='text-[10px] text-muted-foreground'>Parsing {parsingProgress}% {fastMode && '(fast mode)'}</p>
                    <Button type='button' size='xs' variant='outline' onClick={()=>setCancelParse(true)}>Cancel</Button>
                  </div>
                )}
              </div>
              <div className='flex items-center gap-2 text-xs'>
                <label className='flex items-center gap-1 cursor-pointer select-none'>
                  <input type='checkbox' checked={fastMode} onChange={e=>setFastMode(e.target.checked)} />
                  Fast mode (sample large PDFs / simplified DOCX)
                </label>
              </div>
              {/* Textarea removed per request; only file drag & drop now */}
              <Button disabled={!text || loading} onClick={runChecks}>{loading ? 'Analyzing...' : 'Run Check'}</Button>
            </CardContent>
          </Card>
          {result && (
            <div className='grid gap-6 md:grid-cols-2'>
              <Card className='md:col-span-2'>
                  <CardHeader>
                    <CardTitle>Overall Score</CardTitle>
                    <CardDescription>Weighted across 5 stricter standards (length & sections enforced).</CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-4'>
                    <div className='text-4xl font-bold'>{result.overall}/100</div>
                    <div className='flex-1'>
                      <Progress value={result.overall} />
                    </div>
                  </div>
                    {result.flags && result.flags.length>0 && (
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {result.flags.map(f=> <span key={f} className='rounded bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-semibold'>{f.replace(/_/g,' ')}</span>)}
                      </div>
                    )}
                </CardContent>
              </Card>
              {standardsMeta.map(s => {
                const d = result.details[s.key];
                return (
                  <Card key={s.key}>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        {s.label}
                        <Badge variant='outline'>{d.score}</Badge>
                      </CardTitle>
                      <CardDescription>{d.note}</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-2 text-sm'>
                      {s.key==='orthography' && <p>Potential misspellings: <strong>{d.issues}</strong></p>}
                      {s.key==='clarity' && <p>Avg sentence length: {d.avgSentenceLength}</p>}
                      {s.key==='structure' && <p>Sections detected: {d.found}/4</p>}
                      {s.key==='plagiarism' && <p>Diversity: {d.diversity}</p>}
                      <Progress value={d.score} />
                    </CardContent>
                  </Card>
                );
              })}
              {aiExtra && (
                <Card className='md:col-span-2'>
                  <CardHeader>
                    <CardTitle>AI Feedback (Gemini)</CardTitle>
                    <CardDescription>Model-derived scoring & suggestions.</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-2 text-sm'>
                    {aiExtra.error && <p className='text-red-500'>{aiExtra.error}</p>}
          {aiExtra.overall_ai_score != null && (
                      <div className='flex items-center gap-4'>
                        <div className='text-2xl font-semibold'>AI Avg: {Math.round(aiExtra.overall_ai_score)}/100</div>
            {aiExtra.chunks && <div className='text-xs text-muted-foreground'>Chunks: {aiExtra.chunks}</div>}
                      </div>
                    )}
                    {aiExtra.raw && <pre className='whitespace-pre-wrap text-xs p-2 bg-muted rounded'>{aiExtra.raw}</pre>}
                    {aiExtra.improvement_suggestions && (
                      <div>
                        <p className='font-semibold mb-1'>Suggestions</p>
                        <ul className='list-disc list-inside space-y-1'>
                          {aiExtra.improvement_suggestions.map((s,i)=><li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {aiExtra.risk_flags && aiExtra.risk_flags.length>0 && (
                      <div>
                        <p className='font-semibold mb-1'>Risk Flags</p>
                        <ul className='list-disc list-inside space-y-1'>
                          {aiExtra.risk_flags.map((s,i)=><li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {['orthography_comment','clarity_comment','structure_comment','originality_comment'].map(k=> aiExtra[k] && (
                      <div key={k}>
                        <p className='font-semibold capitalize'>{k.replace('_',' ')}</p>
                        <p>{aiExtra[k]}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
