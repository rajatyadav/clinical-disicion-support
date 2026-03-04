"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { streamChat } from "@/lib/api";
import { Send, Bot, User, Loader2, Database } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  streaming?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  "vitals_thresholds.txt": "Vitals Reference",
  "clinical_protocols.txt": "Clinical Protocols",
  "patient_summaries.txt": "Patient Record",
};

const DEMO_QUESTIONS = [
  "Why is this patient flagged?",
  "Summarize the last 24h vitals",
  "Is the current SpO₂ concerning?",
  "What does the BP trend suggest?",
];

interface Props {
  patientId?: number;
  patientName?: string;
  globalMode?: boolean;
}

export function RAGChat({ patientId, patientName, globalMode = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: globalMode
        ? "Ask me anything about your patients — \"Show me patients with abnormal patterns\", \"Who needs attention right now?\""
        : `I have access to ${patientName ? `${patientName}'s` : "this patient's"} vitals, medical history, and clinical guidelines. Ask me anything.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(question?: string) {
    const q = (question ?? input).trim();
    if (!q || isLoading) return;
    setInput("");
    setIsLoading(true);

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true, sources: [] };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      let fullText = "";
      let sources: string[] = [];
      let firstChunk = true;

      for await (const chunk of streamChat(q, patientId)) {
        if (firstChunk && chunk.startsWith("__SOURCES__:")) {
          const sourceLine = chunk.split("\n")[0];
          const sourceStr = sourceLine.replace("__SOURCES__:", "");
          sources = sourceStr ? sourceStr.split(",").filter(Boolean) : [];
          const rest = chunk.slice(sourceLine.length + 1);
          fullText += rest;
          firstChunk = false;
        } else {
          firstChunk = false;
          fullText += chunk;
        }

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...assistantMsg,
            content: fullText,
            sources,
            streaming: true,
          };
          return updated;
        });
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: fullText,
          sources,
          streaming: false,
        };
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Failed to get a response. Please check that the backend is running.",
          streaming: false,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="flex flex-col h-full border-slate-200">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot size={18} className="text-blue-600" />
          <span>Clinical AI Assistant</span>
          <Badge variant="outline" className="ml-auto text-xs bg-blue-50 text-blue-700 border-blue-200">
            RAG · Claude
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 overflow-hidden p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-blue-600" />
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
                <div
                  className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {msg.content || (msg.streaming ? <Loader2 size={14} className="animate-spin" /> : "")}
                </div>
                {msg.sources && msg.sources.length > 0 && !msg.streaming && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Database size={12} className="text-slate-400 mt-0.5" />
                    {msg.sources.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5"
                      >
                        {SOURCE_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-slate-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Demo quick questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {DEMO_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full px-3 py-1 border border-slate-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about this patient..."
            disabled={isLoading}
            className="text-sm"
          />
          <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} size="icon">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
