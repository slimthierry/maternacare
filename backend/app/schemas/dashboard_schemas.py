"""Dashboard schemas for aggregate statistics."""

from pydantic import BaseModel


class RiskDistribution(BaseModel):
    """Risk level distribution."""

    low: int = 0
    medium: int = 0
    high: int = 0
    very_high: int = 0


class AlertSummary(BaseModel):
    """Alert summary by severity."""

    info: int = 0
    warning: int = 0
    critical: int = 0


class RecentDelivery(BaseModel):
    """Summary of a recent delivery."""

    id: int
    patient_name: str
    delivery_type: str
    gestational_week: int
    date: str


class UpcomingAppointment(BaseModel):
    """Summary of an upcoming appointment."""

    id: int
    patient_name: str
    date: str
    consultation_type: str
    gestational_week: int


class DashboardResponse(BaseModel):
    """Main dashboard statistics response."""

    active_pregnancies: int = 0
    upcoming_appointments: list[UpcomingAppointment] = []
    current_alerts: AlertSummary = AlertSummary()
    recent_deliveries: list[RecentDelivery] = []
    risk_distribution: RiskDistribution = RiskDistribution()
    total_patients: int = 0
    deliveries_this_month: int = 0
