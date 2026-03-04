"""FastAPI main entrypoint — Healthcare RAG Demo."""
import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, Patient, VitalsReading
from schemas import PatientSchema, PatientDetailSchema, VitalsReadingSchema, ChatRequest
from vitals_simulator import generate_vitals
from seed import seed

load_dotenv()

# Create tables and seed data on startup
Base.metadata.create_all(bind=engine)
seed()

app = FastAPI(title="Healthcare RAG Demo", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/patients", response_model=list[PatientSchema])
def list_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    return patients


@app.get("/patients/{patient_id}", response_model=PatientDetailSchema)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.get("/patients/{patient_id}/vitals", response_model=list[VitalsReadingSchema])
def get_patient_vitals(patient_id: int, hours: int = 24, db: Session = Depends(get_db)):
    """Return vitals history for the last N hours."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    vitals = (
        db.query(VitalsReading)
        .filter(VitalsReading.patient_id == patient_id, VitalsReading.timestamp >= cutoff)
        .order_by(VitalsReading.timestamp.asc())
        .all()
    )
    return vitals


@app.websocket("/ws/vitals/{patient_id}")
async def vitals_websocket(websocket: WebSocket, patient_id: int, db: Session = Depends(get_db)):
    """Stream simulated vitals to frontend every 2 seconds."""
    await websocket.accept()
    try:
        while True:
            vitals_data = generate_vitals(patient_id, db)
            await websocket.send_text(json.dumps(vitals_data))
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass


@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Streaming RAG Q&A endpoint."""
    from rag.pipeline import stream_rag_response

    patient_context = ""
    if request.patient_id:
        patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
        if patient:
            latest_vitals = (
                db.query(VitalsReading)
                .filter(VitalsReading.patient_id == request.patient_id)
                .order_by(VitalsReading.timestamp.desc())
                .first()
            )
            patient_context = f"""Patient: {patient.name}, Age: {patient.age}, Gender: {patient.gender}
Room: {patient.room}, Diagnosis: {patient.diagnosis}, Status: {patient.status}
Attending: {patient.attending_physician}, Admitted: {patient.admission_date}
Allergies: {patient.allergies}
Medications: {patient.medications}"""

            if latest_vitals:
                patient_context += f"""
Latest Vitals ({latest_vitals.timestamp.strftime('%Y-%m-%d %H:%M')} UTC):
  Heart Rate: {latest_vitals.heart_rate} bpm
  Blood Pressure: {latest_vitals.systolic_bp}/{latest_vitals.diastolic_bp} mmHg
  SpO2: {latest_vitals.spo2}%
  Temperature: {latest_vitals.temperature}°C
  Respiratory Rate: {latest_vitals.respiratory_rate} bpm"""

    async def generate():
        async for chunk in stream_rag_response(request.question, patient_context):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/admin/ingest")
def ingest_knowledge_base():
    """Re-index the RAG knowledge base."""
    from rag.ingest import ingest_documents
    ingest_documents()
    return {"status": "ingested"}


@app.get("/health")
def health():
    return {"status": "ok"}
