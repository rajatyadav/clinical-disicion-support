"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, ChevronRight, Database, Brain, MessageSquare, Search, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    id: 1,
    icon: MessageSquare,
    label: "User Question",
    color: "blue",
    description: "Clinician types a natural language question",
    example: '"Why is this patient flagged?"',
    detail: "The care team member types a plain English question — no filters, no tabs, no searching.",
  },
  {
    id: 2,
    icon: Brain,
    label: "Embed Question",
    color: "purple",
    description: "Sentence Transformer converts question to a vector",
    example: "all-MiniLM-L6-v2 → 384-dim vector",
    detail: "The question is converted into a numerical vector (embedding) that captures its semantic meaning using all-MiniLM-L6-v2.",
  },
  {
    id: 3,
    icon: Search,
    label: "Vector Search",
    color: "amber",
    description: "ChromaDB finds the most relevant chunks",
    example: "Top 4 chunks by cosine similarity",
    detail: "ChromaDB runs a similarity search against the indexed medical knowledge base (vitals thresholds, clinical protocols, patient summaries) and returns the most relevant passages.",
  },
  {
    id: 4,
    icon: Database,
    label: "Context Assembly",
    color: "orange",
    description: "Retrieved chunks + patient data combined",
    example: "Prompt = question + chunks + vitals snapshot",
    detail: "The RAG pipeline assembles a rich prompt: the user's question + retrieved clinical knowledge chunks + the patient's current vitals and history.",
  },
  {
    id: 5,
    icon: Brain,
    label: "Claude claude-sonnet-4-6",
    color: "green",
    description: "LLM generates a grounded answer",
    example: "claude-sonnet-4-6 with stream=True",
    detail: 'Claude receives only grounded context — it cannot "hallucinate" facts that aren\'t in the retrieved documents. The system prompt instructs it to cite sources.',
  },
  {
    id: 6,
    icon: MessageSquare,
    label: "Streaming Response",
    color: "teal",
    description: "Answer streams to UI with source citations",
    example: "text/plain streaming + source labels",
    detail: "The response streams token-by-token to the frontend. Source citations (Vitals Reference, Clinical Protocols, Patient Record) are shown so clinicians can verify the source.",
  },
];

const colorMap = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", badge: "bg-green-50 text-green-700 border-green-200" },
  teal: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", badge: "bg-teal-50 text-teal-700 border-teal-200" },
};

export default function ArchitecturePage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">RAG Architecture</h1>
          <p className="text-xs text-slate-500">How the AI assistant works under the hood</p>
        </div>
        <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <Layers size={12} /> Retrieval-Augmented Generation
        </Badge>
      </header>

      <div className="max-w-5xl mx-auto p-8">
        {/* Title card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">From Question to Clinical Insight</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Instead of building 15 filters, we let clinicians ask questions naturally.
            RAG grounds the AI in real patient data and verified clinical guidelines — no hallucinations.
          </p>
        </div>

        {/* Pipeline diagram */}
        <div className="flex items-stretch gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const colors = colorMap[step.color as keyof typeof colorMap];
            const isActive = activeStep === step.id;

            return (
              <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                  className={`
                    flex flex-col items-center p-4 rounded-xl border-2 transition-all w-36 text-center cursor-pointer
                    ${isActive ? `${colors.border} ${colors.bg}` : "border-slate-200 bg-white hover:border-slate-300"}
                  `}
                >
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-2`}>
                    <Icon size={18} className={colors.text} />
                  </div>
                  <p className={`text-xs font-bold mb-1 ${isActive ? colors.text : "text-slate-700"}`}>{step.label}</p>
                  <p className="text-xs text-slate-500 leading-tight">{step.description}</p>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={18} className="text-slate-300 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {activeStep !== null && (() => {
          const step = STEPS.find((s) => s.id === activeStep)!;
          const Icon = step.icon;
          const colors = colorMap[step.color as keyof typeof colorMap];
          return (
            <div className={`bg-white rounded-2xl border-2 ${colors.border} p-6 mb-8 transition-all`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon size={20} className={colors.text} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${colors.text}`}>Step {step.id}: {step.label}</h3>
                  <Badge variant="outline" className={`text-xs ${colors.badge}`}>{step.example}</Badge>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">{step.detail}</p>
            </div>
          );
        })()}

        {/* Stack breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Vector Store</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-amber-600" />
                <span className="text-sm text-slate-700">ChromaDB (local)</span>
              </div>
              <p className="text-xs text-slate-500">Medical knowledge base ingested at startup. Chunks indexed with 384-dim embeddings.</p>
              <div className="mt-2 space-y-1">
                {["vitals_thresholds.txt", "clinical_protocols.txt", "patient_summaries.txt"].map((f) => (
                  <div key={f} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-slate-600">{f}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Embedding Model</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-purple-600" />
                <span className="text-sm text-slate-700">all-MiniLM-L6-v2</span>
              </div>
              <p className="text-xs text-slate-500">Sentence Transformers model. Runs locally, no API cost for embeddings. 384-dimensional vectors.</p>
              <div className="mt-2 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-slate-600">
                sentence-transformers
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">LLM</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-green-600" />
                <span className="text-sm text-slate-700">Claude claude-sonnet-4-6</span>
              </div>
              <p className="text-xs text-slate-500">Anthropic's Claude claude-sonnet-4-6. System prompt constrains it to only answer from retrieved context.</p>
              <div className="mt-2 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-slate-600">
                anthropic SDK · stream=True
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-800 rounded-xl p-5 font-mono text-sm text-slate-300">
          <p className="text-slate-500 text-xs mb-3"># RAG pipeline flow</p>
          <p><span className="text-blue-400">question</span> → embed(all-MiniLM-L6-v2) → <span className="text-amber-400">ChromaDB</span>.similarity_search(k=4)</p>
          <p className="mt-1">→ build_prompt(question + chunks + patient_context)</p>
          <p className="mt-1">→ <span className="text-green-400">claude-sonnet-4-6</span>.messages.stream() → <span className="text-teal-400">StreamingResponse</span> to UI</p>
        </div>
      </div>
    </div>
  );
}
