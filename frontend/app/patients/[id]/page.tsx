"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchPatient, fetchPatientVitals, createVitalsWebSocket } from "@/lib/api";
import type { PatientDetail, VitalsReading, LiveVitals } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { VitalsCard } from "@/components/VitalsCard";
import { VitalsChart } from "@/components/VitalsChart";
import { RAGChat } from "@/components/RAGChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowLeft, Pill, AlertCircle, Wifi } from "lucide-react";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<LiveVitals[]>([]);
  const [liveVitals, setLiveVitals] = useState<LiveVitals | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchPatient(patientId).then(setPatient);
    fetchPatientVitals(patientId, 1).then((v) => {
      setVitalsHistory(v.map((r) => ({ ...r, status: "stable" })));
    });
  }, [patientId]);

  useEffect(() => {
    const ws = createVitalsWebSocket(patientId);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onmessage = (event) => {
      const data: LiveVitals = JSON.parse(event.data);
      setLiveVitals(data);
      setVitalsHistory((prev) => [...prev.slice(-59), data]);
      if (patient && data.status !== patient.status) {
        setPatient((p) => p ? { ...p, status: data.status as PatientDetail["status"] } : p);
      }
    };

    return () => ws.close();
  }, [patientId, patient?.status]);

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Loading patient...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Activity size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900">{patient.name}</h1>
            <StatusBadge status={patient.status} />
            <Badge variant="outline" className="font-mono text-xs">{patient.room}</Badge>
          </div>
          <p className="text-xs text-slate-500">
            {patient.age}y · {patient.gender} · {patient.diagnosis} · Dr. {patient.attending_physician}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${wsConnected ? "text-emerald-600" : "text-slate-400"}`}>
          <Wifi size={13} />
          {wsConnected ? "Live" : "Connecting..."}
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Left panel — vitals */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Alert Banner */}
          {patient.status === "critical" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Critical Alert — Immediate Attention Required</p>
                <p className="text-xs text-red-600">Patient vitals outside safe thresholds. Ask the AI assistant for clinical context.</p>
              </div>
            </div>
          )}
          {patient.status === "warning" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Warning — Monitor Closely</p>
                <p className="text-xs text-amber-600">One or more vitals outside normal range.</p>
              </div>
            </div>
          )}

          {/* Live Vitals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Current Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <VitalsCard vitals={liveVitals} />
            </CardContent>
          </Card>

          {/* Vitals Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Vitals Trend — Last {vitalsHistory.length} readings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VitalsChart history={vitalsHistory} />
            </CardContent>
          </Card>

          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Pill size={14} /> Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {patient.medications.split(", ").map((med) => (
                    <li key={med} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {med}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">Patient Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Admitted</span>
                  <span className="text-slate-800">{patient.admission_date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Allergies</span>
                  <span className="text-slate-800 text-right">{patient.allergies}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Physician</span>
                  <span className="text-slate-800">{patient.attending_physician}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right panel — RAG Chat */}
        <div className="w-[420px] border-l border-slate-200 p-4 bg-white flex flex-col">
          <RAGChat patientId={patientId} patientName={patient.name} />
        </div>
      </div>
    </div>
  );
}
