"""Ultrasound model for imaging examinations."""

from sqlalchemy import Date, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Ultrasound(Base, TimestampMixin):
    """Ultrasound examination record with fetal measurements."""

    __tablename__ = "ultrasounds"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pregnancy_id: Mapped[int] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[str] = mapped_column(Date, nullable=False)
    gestational_week: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # dating, morphology, growth, doppler
    fetal_weight_g: Mapped[int | None] = mapped_column(Integer, nullable=True)
    biparietal_diameter_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    femur_length_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    abdominal_circumference_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    amniotic_fluid_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    placenta_position: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fetal_heart_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)
    anomalies_detected: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    practitioner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    pregnancy = relationship("Pregnancy", back_populates="ultrasounds")
    practitioner = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Ultrasound(id={self.id}, pregnancy_id={self.pregnancy_id}, type={self.type})>"
