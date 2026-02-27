"""Pregnancy model for tracking gestational progress."""

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Pregnancy(Base, TimestampMixin):
    """Pregnancy record tracking the full gestational journey."""

    __tablename__ = "pregnancies"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lmp_date: Mapped[str] = mapped_column(Date, nullable=False)
    estimated_due_date: Mapped[str] = mapped_column(Date, nullable=False)
    actual_due_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active"
    )  # active, delivered, complicated, loss
    risk_level: Mapped[str] = mapped_column(
        String(20), nullable=False, default="low"
    )  # low, medium, high, very_high
    gravida: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    para: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="pregnancies")
    consultations = relationship("Consultation", back_populates="pregnancy", lazy="selectin")
    ultrasounds = relationship("Ultrasound", back_populates="pregnancy", lazy="selectin")
    alerts = relationship("Alert", back_populates="pregnancy", lazy="selectin")
    delivery = relationship("Delivery", back_populates="pregnancy", uselist=False, lazy="selectin")
    postpartum_visits = relationship("PostPartum", back_populates="pregnancy", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Pregnancy(id={self.id}, patient_id={self.patient_id}, status={self.status})>"
