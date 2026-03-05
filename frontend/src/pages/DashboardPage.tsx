import { useState, useEffect } from 'react';
import {
  Baby,
  Calendar,
  Bell,
  HeartPulse,
  Users,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';
import type { DashboardStats } from '../types';
import { dashboard } from '../services/api';

export function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboard.get()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-500">{error || 'Erreur de chargement'}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary mt-4">
          Reessayer
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Grossesses actives', value: data.active_pregnancies, icon: Baby, color: 'text-brand-500' },
    { label: 'Patientes totales', value: data.total_patients, icon: Users, color: 'text-blue-500' },
    { label: 'RDV a venir', value: data.upcoming_appointments.length, icon: Calendar, color: 'text-emerald-500' },
    { label: 'Accouchements ce mois', value: data.deliveries_this_month, icon: HeartPulse, color: 'text-purple-500' },
  ];

  const alertsSummary = [
    { severity: 'Critiques', count: data.current_alerts.critical, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { severity: 'Avertissements', count: data.current_alerts.warning, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { severity: 'Informations', count: data.current_alerts.info, icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ];

  const totalRisk = data.risk_distribution.low + data.risk_distribution.medium + data.risk_distribution.high + data.risk_distribution.very_high;
  const riskDistribution = [
    { level: 'Faible', count: data.risk_distribution.low, percentage: totalRisk ? Math.round((data.risk_distribution.low / totalRisk) * 100) : 0, color: 'bg-emerald-500' },
    { level: 'Moyen', count: data.risk_distribution.medium, percentage: totalRisk ? Math.round((data.risk_distribution.medium / totalRisk) * 100) : 0, color: 'bg-amber-500' },
    { level: 'Eleve', count: data.risk_distribution.high, percentage: totalRisk ? Math.round((data.risk_distribution.high / totalRisk) * 100) : 0, color: 'bg-orange-500' },
    { level: 'Tres eleve', count: data.risk_distribution.very_high, percentage: totalRisk ? Math.round((data.risk_distribution.very_high / totalRisk) * 100) : 0, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Tableau de bord
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Vue d'ensemble de l'activite maternite
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Summary */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-500" />
            Alertes actives
          </h3>
          <div className="space-y-3">
            {alertsSummary.map((alert) => (
              <div key={alert.severity} className={`flex items-center justify-between p-3 rounded-lg ${alert.bg}`}>
                <div className="flex items-center gap-3">
                  <alert.icon className={`w-5 h-5 ${alert.color}`} />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {alert.severity}
                  </span>
                </div>
                <span className={`text-lg font-bold ${alert.color}`}>{alert.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Distribution des risques
          </h3>
          <div className="space-y-3">
            {riskDistribution.map((risk) => (
              <div key={risk.level}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[var(--color-text-secondary)]">{risk.level}</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{risk.count} ({risk.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                  <div className={`h-full ${risk.color} rounded-full transition-all`} style={{ width: `${risk.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-500" />
            Prochains rendez-vous
          </h3>
          <div className="space-y-3">
            {data.upcoming_appointments.length === 0 ? (
              <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">Aucun rendez-vous a venir</p>
            ) : (
              data.upcoming_appointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{appt.patient_name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">SA {appt.gestational_week} - {appt.consultation_type}</p>
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)]">{appt.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-brand-500" />
          Accouchements recents
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Patiente</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Type</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Semaine</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_deliveries.map((delivery) => (
                <tr key={delivery.id} className="border-b border-[var(--color-border-secondary)]">
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{delivery.patient_name}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{delivery.delivery_type}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">SA {delivery.gestational_week}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{delivery.date}</td>
                </tr>
              ))}
              {data.recent_deliveries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[var(--color-text-tertiary)]">
                    Aucun accouchement recent
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
