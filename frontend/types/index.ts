export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  room: string;
  diagnosis: string;
  status: "stable" | "warning" | "critical";
  attending_physician: string;
  admission_date: string;
  allergies: string;
  medications: string;
}

export interface VitalsReading {
  id: number;
  patient_id: number;
  timestamp: string;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  spo2: number;
  temperature: number;
  respiratory_rate: number;
}

export interface PatientDetail extends Patient {
  vitals: VitalsReading[];
}

export interface LiveVitals extends VitalsReading {
  status: string;
}
