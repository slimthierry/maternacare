"""PostPartum model for post-delivery maternal follow-up."""

from sqlalchemy import Date, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class PostPartum(Base, TimestampMixin):
    """Post-partum follow-up record including mood and physical recovery."""

    __tablename__ = "postpartum_visits"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pregnancy_id: Mapped[int] = mapped_column(
        ForeignKey("pregnancies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[str] = mapped_column(Date, nullable=False)
    days_postpartum: Mapped[int] = mapped_column(Integer, nullable=False)
    mood_score: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1-10
    edinburgh_score: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # 0-30, depression screening
    breastfeeding_status: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # exclusive, mixed, formula, stopped
    uterine_involution: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # normal, delayed
    wound_healing: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # good, infection, dehiscence
    complications: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    practitioner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    pregnancy = relationship("Pregnancy", back_populates="postpartum_visits")
    practitioner = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<PostPartum(id={self.id}, days={self.days_postpartum})>"
