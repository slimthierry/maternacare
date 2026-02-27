"""Patient model for mother records."""

from sqlalchemy import JSON, Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Patient(Base, TimestampMixin):
    """Patient (mother) record linked to hospital IPP."""

    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ipp: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    date_of_birth: Mapped[str] = mapped_column(Date, nullable=False)
    blood_type: Mapped[str | None] = mapped_column(String(5), nullable=True)
    rh_factor: Mapped[str | None] = mapped_column(String(10), nullable=True)
    medical_history: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)
    allergies: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    pregnancies = relationship("Pregnancy", back_populates="patient", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Patient(id={self.id}, ipp={self.ipp}, name={self.last_name} {self.first_name})>"
