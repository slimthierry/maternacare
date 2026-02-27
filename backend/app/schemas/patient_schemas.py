"""Patient schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel


class PatientBase(BaseModel):
    """Base patient fields."""

    first_name: str
    last_name: str
    date_of_birth: date
    blood_type: str | None = None
    rh_factor: str | None = None
    medical_history: dict | None = None
    allergies: list[str] | None = None
    phone: str | None = None
    emergency_contact: str | None = None


class PatientCreate(PatientBase):
    """Fields required to create a patient."""

    ipp: str


class PatientUpdate(BaseModel):
    """Fields that can be updated on a patient."""

    first_name: str | None = None
    last_name: str | None = None
    blood_type: str | None = None
    rh_factor: str | None = None
    medical_history: dict | None = None
    allergies: list[str] | None = None
    phone: str | None = None
    emergency_contact: str | None = None


class PatientResponse(PatientBase):
    """Patient response with all fields."""

    id: int
    ipp: str
    created_at: datetime

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    """Paginated list of patients."""

    items: list[PatientResponse]
    total: int
    page: int
    page_size: int
