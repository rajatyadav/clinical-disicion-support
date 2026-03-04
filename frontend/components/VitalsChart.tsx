"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { LiveVitals } from "@/types";

interface Props {
  history: LiveVitals[];
}

export function VitalsChart({ history }: Props) {
  const data = history.slice(-30).map((v) => ({
    time: new Date(v.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    "HR": Math.round(v.heart_rate),
    "Sys BP": Math.round(v.systolic_bp),
    "SpO₂": parseFloat(v.spo2.toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="HR" stroke="#ef4444" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="Sys BP" stroke="#3b82f6" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="SpO₂" stroke="#10b981" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
