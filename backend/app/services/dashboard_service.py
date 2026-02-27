"""Dashboard service for aggregate statistics."""

from datetime import date, datetime, timedelta, timezone

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert_models import Alert
from app.models.consultation_models import Consultation
from app.models.delivery_models import Delivery
from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy
from app.schemas.dashboard_schemas import (
    AlertSummary,
    DashboardResponse,
    RecentDelivery,
    RiskDistribution,
    UpcomingAppointment,
)


async def get_dashboard(db: AsyncSession) -> DashboardResponse:
    """Get dashboard statistics."""
    now = datetime.now(timezone.utc)
    today = date.today()

    # Active pregnancies count
    active_result = await db.execute(
        select(func.count()).where(Pregnancy.status == "active")
    )
    active_pregnancies = active_result.scalar() or 0

    # Total patients
    patients_result = await db.execute(select(func.count()).select_from(Patient))
    total_patients = patients_result.scalar() or 0

    # Alert summary
    alert_summary = AlertSummary()
    for severity in ["info", "warning", "critical"]:
        count_result = await db.execute(
            select(func.count()).where(
                and_(Alert.status == "active", Alert.severity == severity)
            )
        )
        setattr(alert_summary, severity, count_result.scalar() or 0)

    # Risk distribution
    risk_dist = RiskDistribution()
    for level in ["low", "medium", "high", "very_high"]:
        count_result = await db.execute(
            select(func.count()).where(
                and_(Pregnancy.status == "active", Pregnancy.risk_level == level)
            )
        )
        setattr(risk_dist, level, count_result.scalar() or 0)

    # Deliveries this month
    first_of_month = today.replace(day=1)
    deliveries_month_result = await db.execute(
        select(func.count()).where(Delivery.date >= first_of_month)
    )
    deliveries_this_month = deliveries_month_result.scalar() or 0

    # Recent deliveries (last 5)
    recent_deliveries_result = await db.execute(
        select(Delivery)
        .order_by(Delivery.date.desc())
        .limit(5)
    )
    recent_deliveries_rows = recent_deliveries_result.scalars().all()
    recent_deliveries = []
    for d in recent_deliveries_rows:
        pregnancy = await db.get(Pregnancy, d.pregnancy_id)
        patient_name = ""
        if pregnancy and pregnancy.patient:
            patient_name = f"{pregnancy.patient.last_name} {pregnancy.patient.first_name}"
        recent_deliveries.append(
            RecentDelivery(
                id=d.id,
                patient_name=patient_name,
                delivery_type=d.delivery_type,
                gestational_week=d.gestational_week,
                date=str(d.date),
            )
        )

    # Upcoming appointments (next 7 days)
    next_week = today + timedelta(days=7)
    upcoming_result = await db.execute(
        select(Consultation)
        .where(
            and_(
                Consultation.next_appointment >= today,
                Consultation.next_appointment <= next_week,
            )
        )
        .order_by(Consultation.next_appointment)
        .limit(10)
    )
    upcoming_rows = upcoming_result.scalars().all()
    upcoming_appointments = []
    for c in upcoming_rows:
        pregnancy = await db.get(Pregnancy, c.pregnancy_id)
        patient_name = ""
        if pregnancy and pregnancy.patient:
            patient_name = f"{pregnancy.patient.last_name} {pregnancy.patient.first_name}"
        upcoming_appointments.append(
            UpcomingAppointment(
                id=c.id,
                patient_name=patient_name,
                date=str(c.next_appointment),
                consultation_type=c.consultation_type,
                gestational_week=c.gestational_week,
            )
        )

    return DashboardResponse(
        active_pregnancies=active_pregnancies,
        upcoming_appointments=upcoming_appointments,
        current_alerts=alert_summary,
        recent_deliveries=recent_deliveries,
        risk_distribution=risk_dist,
        total_patients=total_patients,
        deliveries_this_month=deliveries_this_month,
    )
