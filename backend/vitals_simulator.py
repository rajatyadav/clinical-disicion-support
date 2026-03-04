"""Generates realistic simulated vitals for WebSocket streaming."""
import random
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from models import Patient, VitalsReading


VITALS_PROFILES = {
    1: {"hr": 118, "sbp": 88,  "dbp": 55,  "spo2": 91.5, "temp": 38.9, "rr": 24},  # Sarah — critical
    2: {"hr": 72,  "sbp": 122, "dbp": 78,  "spo2": 97.5, "temp": 36.8, "rr": 14},  # James — stable
    3: {"hr": 95,  "sbp": 138, "dbp": 85,  "spo2": 88.0, "temp": 37.2, "rr": 22},  # Maria — warning
    4: {"hr": 88,  "sbp": 185, "dbp": 115, "spo2": 95.0, "temp": 37.0, "rr": 16},  # Robert — warning
    5: {"hr": 82,  "sbp": 128, "dbp": 76,  "spo2": 96.0, "temp": 37.8, "rr": 18},  # Eleanor — stable
    6: {"hr": 105, "sbp": 118, "dbp": 72,  "spo2": 97.0, "temp": 37.1, "rr": 20},  # Daniel — stable
    7: {"hr": 90,  "sbp": 148, "dbp": 92,  "spo2": 94.5, "temp": 37.3, "rr": 17},  # Patricia — warning
    8: {"hr": 76,  "sbp": 118, "dbp": 74,  "spo2": 98.5, "temp": 36.9, "rr": 14},  # Thomas — stable
}


def get_patient_status(hr, sbp, spo2, temp, rr):
    if spo2 < 90 or hr > 130 or hr < 40 or sbp < 90 or sbp > 200 or temp > 39.5:
        return "critical"
    if spo2 < 94 or hr > 100 or sbp > 160 or sbp < 100 or temp > 38.5 or rr > 20:
        return "warning"
    return "stable"


def generate_vitals(patient_id: int, db: Session) -> dict:
    profile = VITALS_PROFILES.get(patient_id, VITALS_PROFILES[2])

    hr = round(profile["hr"] + random.uniform(-5, 5), 1)
    sbp = round(profile["sbp"] + random.uniform(-8, 8), 1)
    dbp = round(profile["dbp"] + random.uniform(-5, 5), 1)
    spo2 = round(max(80, min(100, profile["spo2"] + random.uniform(-1.5, 1.5))), 1)
    temp = round(profile["temp"] + random.uniform(-0.2, 0.2), 1)
    rr = round(profile["rr"] + random.uniform(-1, 1), 1)

    # Save to DB
    reading = VitalsReading(
        patient_id=patient_id,
        timestamp=datetime.utcnow(),
        heart_rate=hr,
        systolic_bp=sbp,
        diastolic_bp=dbp,
        spo2=spo2,
        temperature=temp,
        respiratory_rate=rr,
    )
    db.add(reading)

    # Update patient status
    status = get_patient_status(hr, sbp, spo2, temp, rr)
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient:
        patient.status = status

    db.commit()

    return {
        "patient_id": patient_id,
        "timestamp": datetime.utcnow().isoformat(),
        "heart_rate": hr,
        "systolic_bp": sbp,
        "diastolic_bp": dbp,
        "spo2": spo2,
        "temperature": temp,
        "respiratory_rate": rr,
        "status": status,
    }
