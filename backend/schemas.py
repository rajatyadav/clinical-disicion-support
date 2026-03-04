from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class VitalsReadingSchema(BaseModel):
    id: int
    patient_id: int
    timestamp: datetime
    heart_rate: float
    systolic_bp: float
    diastolic_bp: float
    spo2: float
    temperature: float
    respiratory_rate: float

    class Config:
        from_attributes = True


class PatientSchema(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    room: str
    diagnosis: str
    status: str
    attending_physician: str
    admission_date: str
    allergies: str
    medications: str

    class Config:
        from_attributes = True


class PatientDetailSchema(PatientSchema):
    vitals: List[VitalsReadingSchema] = []


class ChatRequest(BaseModel):
    question: str
    patient_id: Optional[int] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []
