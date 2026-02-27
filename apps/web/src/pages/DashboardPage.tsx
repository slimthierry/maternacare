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
} from 'lucide-react';

const stats = [
  { label: 'Grossesses actives', value: '47', icon: Baby, color: 'text-brand-500' },
  { label: 'Patientes totales', value: '312', icon: Users, color: 'text-blue-500' },
  { label: 'RDV cette semaine', value: '23', icon: Calendar, color: 'text-emerald-500' },
  { label: 'Accouchements ce mois', value: '8', icon: HeartPulse, color: 'text-purple-500' },
];

const alertsSummary = [
  { severity: 'critical', count: 3, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  { severity: 'warning', count: 7, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { severity: 'info', count: 12, icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
];

const riskDistribution = [
  { level: 'Faible', count: 28, percentage: 60, color: 'bg-emerald-500' },
  { level: 'Moyen', count: 11, percentage: 23, color: 'bg-amber-500' },
  { level: 'Eleve', count: 6, percentage: 13, color: 'bg-orange-500' },
  { level: 'Tres eleve', count: 2, percentage: 4, color: 'bg-red-500' },
];

const recentDeliveries = [
  { patient: 'Dupont Marie', type: 'Voie basse', week: 39, date: '2026-02-25' },
  { patient: 'Martin Sophie', type: 'Cesarienne', week: 38, date: '2026-02-24' },
  { patient: 'Bernard Lea', type: 'Voie basse', week: 40, date: '2026-02-23' },
];

const upcomingAppointments = [
  { patient: 'Petit Claire', date: '2026-02-28', type: 'Routine', week: 32 },
  { patient: 'Moreau Julie', date: '2026-02-28', type: 'Echographie', week: 22 },
  { patient: 'Leroy Emma', date: '2026-03-01', type: 'Urgent', week: 36 },
];

export function DashboardPage() {
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
              <div className={`p-3 rounded-xl bg-[var(--color-bg-tertiary)]`}>
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
                  <span className="text-sm font-medium text-[var(--color-text-primary)] capitalize">
                    {alert.severity === 'critical' ? 'Critiques' : alert.severity === 'warning' ? 'Avertissements' : 'Informations'}
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
            {upcomingAppointments.map((appt, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{appt.patient}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">SA {appt.week} - {appt.type}</p>
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">{appt.date}</span>
              </div>
            ))}
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
              {recentDeliveries.map((delivery, i) => (
                <tr key={i} className="border-b border-[var(--color-border-secondary)]">
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{delivery.patient}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{delivery.type}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">SA {delivery.week}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{delivery.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
