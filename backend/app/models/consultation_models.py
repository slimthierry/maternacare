"""Consultation model for prenatal visits."""

from sqlalchemy import Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Consultation(Base, TimestampMixin):
    """Prenatal consultation record with vital signs and measurements."""

    __tablename__ = "consultations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pregnancy_id: Mapped[int] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[str] = mapped_column(Date, nullable=False)
    gestational_week: Mapped[int] = mapped_column(Integer, nullable=False)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    blood_pressure_systolic: Mapped[int | None] = mapped_column(Integer, nullable=True)
    blood_pressure_diastolic: Mapped[int | None] = mapped_column(Integer, nullable=True)
    uterine_height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    fetal_heart_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)
    glycemia: Mapped[float | None] = mapped_column(Float, nullable=True)
    proteinuria: Mapped[str | None] = mapped_column(
        String(10), nullable=True
    )  # negative, trace, 1+, 2+, 3+, 4+
    edema: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # none, mild, moderate, severe
    practitioner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    consultation_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="routine"
    )  # routine, urgent, specialist
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_appointment: Mapped[str | None] = mapped_column(Date, nullable=True)

    # Relationships
    pregnancy = relationship("Pregnancy", back_populates="consultations")
    practitioner = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Consultation(id={self.id}, pregnancy_id={self.pregnancy_id}, week={self.gestational_week})>"
