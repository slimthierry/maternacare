"""Alert model for clinical risk notifications."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Alert(Base, TimestampMixin):
    """Clinical alert for pregnancy risk detection."""

    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pregnancy_id: Mapped[int] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # pre_eclampsia, gestational_diabetes, iugr, preterm_labor, placenta_previa, rh_incompatibility, anomaly
    severity: Mapped[str] = mapped_column(
        String(10), nullable=False
    )  # info, warning, critical
    description: Mapped[str] = mapped_column(Text, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    acknowledged_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    acknowledged_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active"
    )  # active, acknowledged, resolved
    auto_generated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    pregnancy = relationship("Pregnancy", back_populates="alerts")
    acknowledger = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Alert(id={self.id}, type={self.type}, severity={self.severity})>"
