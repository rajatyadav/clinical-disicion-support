"""Seed 8 demo patients with realistic vitals history."""
from datetime import datetime, timedelta
import random
from database import engine, SessionLocal
from models import Base, Patient, VitalsReading


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Patient).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    patients_data = [
        {
            "name": "Sarah Mitchell",
            "age": 67,
            "gender": "Female",
            "room": "ICU-101",
            "diagnosis": "Sepsis (Early-Warning)",
            "status": "critical",
            "attending_physician": "Dr. Patel",
            "admission_date": "2026-02-28",
            "allergies": "Penicillin",
            "medications": "Vancomycin, Norepinephrine, IV Fluids",
        },
        {
            "name": "James Okafor",
            "age": 54,
            "gender": "Male",
            "room": "CCU-205",
            "diagnosis": "Post-Op Cardiac Surgery",
            "status": "stable",
            "attending_physician": "Dr. Chen",
            "admission_date": "2026-02-27",
            "allergies": "None",
            "medications": "Metoprolol, Aspirin, Heparin",
        },
        {
            "name": "Maria Gonzalez",
            "age": 72,
            "gender": "Female",
            "room": "MED-310",
            "diagnosis": "COPD Exacerbation",
            "status": "warning",
            "attending_physician": "Dr. Kim",
            "admission_date": "2026-03-01",
            "allergies": "Sulfa drugs",
            "medications": "Prednisone, Ipratropium, Albuterol",
        },
        {
            "name": "Robert Hawkins",
            "age": 45,
            "gender": "Male",
            "room": "MED-315",
            "diagnosis": "Hypertensive Emergency",
            "status": "warning",
            "attending_physician": "Dr. Patel",
            "admission_date": "2026-03-01",
            "allergies": "ACE Inhibitors",
            "medications": "Labetalol, Amlodipine",
        },
        {
            "name": "Eleanor Voss",
            "age": 81,
            "gender": "Female",
            "room": "GER-420",
            "diagnosis": "Pneumonia",
            "status": "stable",
            "attending_physician": "Dr. Nguyen",
            "admission_date": "2026-02-29",
            "allergies": "Codeine",
            "medications": "Ceftriaxone, Azithromycin, O2 therapy",
        },
        {
            "name": "Daniel Park",
            "age": 38,
            "gender": "Male",
            "room": "MED-320",
            "diagnosis": "Diabetic Ketoacidosis",
            "status": "stable",
            "attending_physician": "Dr. Chen",
            "admission_date": "2026-03-02",
            "allergies": "None",
            "medications": "Insulin drip, IV Fluids, Potassium",
        },
        {
            "name": "Patricia Wu",
            "age": 59,
            "gender": "Female",
            "room": "CCU-210",
            "diagnosis": "Acute MI — Monitoring",
            "status": "warning",
            "attending_physician": "Dr. Kim",
            "admission_date": "2026-02-28",
            "allergies": "Morphine",
            "medications": "Aspirin, Ticagrelor, Statin, Beta-blocker",
        },
        {
            "name": "Thomas Reed",
            "age": 29,
            "gender": "Male",
            "room": "MED-305",
            "diagnosis": "Post-Op Appendectomy",
            "status": "stable",
            "attending_physician": "Dr. Nguyen",
            "admission_date": "2026-03-02",
            "allergies": "None",
            "medications": "Ibuprofen, Cefazolin",
        },
    ]

    # Vitals profiles per patient (base values with variance for simulation)
    vitals_profiles = {
        "Sarah Mitchell":  {"hr": 118, "sbp": 88,  "dbp": 55,  "spo2": 91.5, "temp": 38.9, "rr": 24},
        "James Okafor":    {"hr": 72,  "sbp": 122, "dbp": 78,  "spo2": 97.5, "temp": 36.8, "rr": 14},
        "Maria Gonzalez":  {"hr": 95,  "sbp": 138, "dbp": 85,  "spo2": 88.0, "temp": 37.2, "rr": 22},
        "Robert Hawkins":  {"hr": 88,  "sbp": 185, "dbp": 115, "spo2": 95.0, "temp": 37.0, "rr": 16},
        "Eleanor Voss":    {"hr": 82,  "sbp": 128, "dbp": 76,  "spo2": 96.0, "temp": 37.8, "rr": 18},
        "Daniel Park":     {"hr": 105, "sbp": 118, "dbp": 72,  "spo2": 97.0, "temp": 37.1, "rr": 20},
        "Patricia Wu":     {"hr": 90,  "sbp": 148, "dbp": 92,  "spo2": 94.5, "temp": 37.3, "rr": 17},
        "Thomas Reed":     {"hr": 76,  "sbp": 118, "dbp": 74,  "spo2": 98.5, "temp": 36.9, "rr": 14},
    }

    for pdata in patients_data:
        patient = Patient(**pdata)
        db.add(patient)
        db.flush()

        profile = vitals_profiles[pdata["name"]]
        now = datetime.utcnow()

        # Generate 24h of readings at 15-min intervals = 96 readings
        for i in range(96):
            ts = now - timedelta(hours=24) + timedelta(minutes=15 * i)
            db.add(VitalsReading(
                patient_id=patient.id,
                timestamp=ts,
                heart_rate=round(profile["hr"] + random.uniform(-8, 8), 1),
                systolic_bp=round(profile["sbp"] + random.uniform(-10, 10), 1),
                diastolic_bp=round(profile["dbp"] + random.uniform(-6, 6), 1),
                spo2=round(max(80, min(100, profile["spo2"] + random.uniform(-2, 2))), 1),
                temperature=round(profile["temp"] + random.uniform(-0.3, 0.3), 1),
                respiratory_rate=round(profile["rr"] + random.uniform(-2, 2), 1),
            ))

    db.commit()
    db.close()
    print(f"Seeded {len(patients_data)} patients with 24h vitals history.")


if __name__ == "__main__":
    seed()
