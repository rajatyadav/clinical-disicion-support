"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LiveVitals } from "@/types";

interface VitalItemProps {
  label: string;
  value: string;
  unit: string;
  alert?: boolean;
}

function VitalItem({ label, value, unit, alert }: VitalItemProps) {
  return (
    <div className={`p-3 rounded-lg border ${alert ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${alert ? "text-red-600" : "text-slate-800"}`}>
        {value}
        <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
      </p>
    </div>
  );
}

export function VitalsCard({ vitals }: { vitals: LiveVitals | null }) {
  if (!vitals) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-slate-400">Connecting to vitals stream...</CardContent>
      </Card>
    );
  }

  const hrAlert = vitals.heart_rate > 100 || vitals.heart_rate < 60;
  const bpAlert = vitals.systolic_bp > 160 || vitals.systolic_bp < 90;
  const spo2Alert = vitals.spo2 < 94;
  const tempAlert = vitals.temperature > 38.0;
  const rrAlert = vitals.respiratory_rate > 20;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <VitalItem label="Heart Rate" value={vitals.heart_rate.toFixed(0)} unit="bpm" alert={hrAlert} />
      <VitalItem label="Blood Pressure" value={`${vitals.systolic_bp.toFixed(0)}/${vitals.diastolic_bp.toFixed(0)}`} unit="mmHg" alert={bpAlert} />
      <VitalItem label="SpO₂" value={vitals.spo2.toFixed(1)} unit="%" alert={spo2Alert} />
      <VitalItem label="Temperature" value={vitals.temperature.toFixed(1)} unit="°C" alert={tempAlert} />
      <VitalItem label="Resp Rate" value={vitals.respiratory_rate.toFixed(0)} unit="bpm" alert={rrAlert} />
      <div className="p-3 rounded-lg border bg-slate-50 border-slate-200">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Last Updated</p>
        <p className="text-sm font-semibold mt-1 text-slate-700">
          {new Date(vitals.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
