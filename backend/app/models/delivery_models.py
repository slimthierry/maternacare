"""Delivery model for birth records."""

from sqlalchemy import Date, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Delivery(Base, TimestampMixin):
    """Delivery/birth record with type, complications, and outcome."""

    __tablename__ = "deliveries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pregnancy_id: Mapped[int] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    date: Mapped[str] = mapped_column(Date, nullable=False)
    gestational_week: Mapped[int] = mapped_column(Integer, nullable=False)
    delivery_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # vaginal_spontaneous, vaginal_assisted, cesarean_planned, cesarean_emergency
    labor_duration_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    complications: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    anesthesia_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="none"
    )  # none, epidural, spinal, general
    blood_loss_ml: Mapped[int | None] = mapped_column(Integer, nullable=True)
    practitioner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    pregnancy = relationship("Pregnancy", back_populates="delivery")
    practitioner = relationship("User", lazy="selectin")
    newborn = relationship("Newborn", back_populates="delivery", uselist=False, lazy="selectin")

    def __repr__(self) -> str:
        return f"<Delivery(id={self.id}, type={self.delivery_type}, week={self.gestational_week})>"
