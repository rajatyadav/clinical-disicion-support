import type { Patient, PatientDetail, VitalsReading } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/patients`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

export async function fetchPatient(id: number): Promise<PatientDetail> {
  const res = await fetch(`${API_BASE}/patients/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch patient");
  return res.json();
}

export async function fetchPatientVitals(id: number, hours = 24): Promise<VitalsReading[]> {
  const res = await fetch(`${API_BASE}/patients/${id}/vitals?hours=${hours}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch vitals");
  return res.json();
}

export function createVitalsWebSocket(patientId: number): WebSocket {
  return new WebSocket(`ws://localhost:8000/ws/vitals/${patientId}`);
}

export async function* streamChat(question: string, patientId?: number): AsyncGenerator<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, patient_id: patientId }),
  });
  if (!res.ok || !res.body) throw new Error("Chat request failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
