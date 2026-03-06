"""PostPartum schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


class PostPartumBase(BaseModel):
    """Base post-partum fields."""

    pregnancy_id: int
    date: date
    days_postpartum: int = Field(ge=0, le=365)
    mood_score: int | None = Field(default=None, ge=1, le=10)
    edinburgh_score: int | None = Field(default=None, ge=0, le=30)
    breastfeeding_status: str | None = None
    uterine_involution: str | None = None
    wound_healing: str | None = None
    complications: list[str] | None = None
    notes: str | None = None

    @field_validator("breastfeeding_status")
    @classmethod
    def valid_breastfeeding(cls, v: str | None) -> str | None:
        if v is not None and v not in ("exclusive", "mixed", "formula", "stopped"):
            raise ValueError("Statut allaitement invalide")
        return v

    @field_validator("uterine_involution")
    @classmethod
    def valid_involution(cls, v: str | None) -> str | None:
        if v is not None and v not in ("normal", "delayed"):
            raise ValueError("Involution uterine invalide")
        return v

    @field_validator("wound_healing")
    @classmethod
    def valid_healing(cls, v: str | None) -> str | None:
        if v is not None and v not in ("good", "infection", "dehiscence"):
            raise ValueError("Cicatrisation invalide")
        return v


class PostPartumCreate(PostPartumBase):
    """Fields required to create a post-partum record."""

    @field_validator("date")
    @classmethod
    def date_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La date de visite ne peut pas etre dans le futur")
        return v


class PostPartumUpdate(BaseModel):
    """Fields that can be updated on a post-partum visit."""

    mood_score: int | None = Field(default=None, ge=1, le=10)
    edinburgh_score: int | None = Field(default=None, ge=0, le=30)
    breastfeeding_status: str | None = None
    uterine_involution: str | None = None
    wound_healing: str | None = None
    complications: list[str] | None = None
    notes: str | None = None


class PostPartumResponse(PostPartumBase):
    """Post-partum visit response with all fields."""

    id: int
    practitioner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PostPartumListResponse(BaseModel):
    """Paginated list of post-partum visits."""

    items: list[PostPartumResponse]
    total: int
    page: int
    page_size: int
