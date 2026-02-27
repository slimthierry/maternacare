"""Newborn model for baby records."""

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Newborn(Base, TimestampMixin):
    """Newborn baby record with vitals and APGAR scores."""

    __tablename__ = "newborns"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    delivery_id: Mapped[int] = mapped_column(
        ForeignKey("deliveries.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    first_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sex: Mapped[str] = mapped_column(String(1), nullable=False)  # M, F
    weight_g: Mapped[int] = mapped_column(Integer, nullable=False)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    head_circumference_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    blood_type: Mapped[str | None] = mapped_column(String(5), nullable=True)
    rh_factor: Mapped[str | None] = mapped_column(String(10), nullable=True)
    apgar_1min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    apgar_5min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    apgar_10min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resuscitation_needed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    nicu_admission: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    delivery = relationship("Delivery", back_populates="newborn")

    def __repr__(self) -> str:
        return f"<Newborn(id={self.id}, sex={self.sex}, weight={self.weight_g}g)>"
