from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class PatientStatus(str, enum.Enum):
    STABLE = "stable"
    WARNING = "warning"
    CRITICAL = "critical"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    room = Column(String)
    diagnosis = Column(String)
    status = Column(String, default=PatientStatus.STABLE)
    attending_physician = Column(String)
    admission_date = Column(String)
    allergies = Column(String)
    medications = Column(String)

    vitals = relationship("VitalsReading", back_populates="patient", cascade="all, delete-orphan")


class VitalsReading(Base):
    __tablename__ = "vitals_readings"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    heart_rate = Column(Float)
    systolic_bp = Column(Float)
    diastolic_bp = Column(Float)
    spo2 = Column(Float)
    temperature = Column(Float)
    respiratory_rate = Column(Float)

    patient = relationship("Patient", back_populates="vitals")
