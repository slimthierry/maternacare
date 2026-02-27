"""PostPartum schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field


class PostPartumBase(BaseModel):
    """Base post-partum fields."""

    pregnancy_id: int
    date: date
    days_postpartum: int = Field(ge=0)
    mood_score: int | None = Field(default=None, ge=1, le=10)
    edinburgh_score: int | None = Field(default=None, ge=0, le=30)
    breastfeeding_status: str | None = None  # exclusive, mixed, formula, stopped
    uterine_involution: str | None = None  # normal, delayed
    wound_healing: str | None = None  # good, infection, dehiscence
    complications: list[str] | None = None
    notes: str | None = None


class PostPartumCreate(PostPartumBase):
    """Fields required to create a post-partum record."""

    pass


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
