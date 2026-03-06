"""Patient schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


class PatientBase(BaseModel):
    """Base patient fields (shared by create, update, response)."""

    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date
    blood_type: str | None = None
    rh_factor: str | None = None
    medical_history: dict | None = None
    allergies: list[str] | None = None
    phone: str | None = Field(default=None, max_length=30)
    emergency_contact: str | None = Field(default=None, max_length=30)

    @field_validator("blood_type")
    @classmethod
    def valid_blood_type(cls, v: str | None) -> str | None:
        if v is not None and v not in ("A", "B", "AB", "O"):
            raise ValueError("Groupe sanguin invalide (A, B, AB, O)")
        return v

    @field_validator("rh_factor")
    @classmethod
    def valid_rh_factor(cls, v: str | None) -> str | None:
        if v is not None and v not in ("positive", "negative"):
            raise ValueError("Rhesus invalide (positive, negative)")
        return v


class PatientCreate(PatientBase):
    """Fields required to create a patient."""

    ipp: str = Field(min_length=1, max_length=50)

    @field_validator("date_of_birth")
    @classmethod
    def dob_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La date de naissance ne peut pas etre dans le futur")
        age_years = (date.today() - v).days / 365.25
        if age_years < 10:
            raise ValueError("La patiente doit avoir au moins 10 ans")
        if age_years > 120:
            raise ValueError("Date de naissance invalide")
        return v


class PatientUpdate(BaseModel):
    """Fields that can be updated on a patient."""

    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    blood_type: str | None = None
    rh_factor: str | None = None
    medical_history: dict | None = None
    allergies: list[str] | None = None
    phone: str | None = Field(default=None, max_length=30)
    emergency_contact: str | None = Field(default=None, max_length=30)

    @field_validator("blood_type")
    @classmethod
    def valid_blood_type(cls, v: str | None) -> str | None:
        if v is not None and v not in ("A", "B", "AB", "O"):
            raise ValueError("Groupe sanguin invalide (A, B, AB, O)")
        return v

    @field_validator("rh_factor")
    @classmethod
    def valid_rh_factor(cls, v: str | None) -> str | None:
        if v is not None and v not in ("positive", "negative"):
            raise ValueError("Rhesus invalide (positive, negative)")
        return v


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
