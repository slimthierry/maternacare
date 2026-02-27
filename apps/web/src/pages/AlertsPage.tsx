import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const mockAlerts = [
  { id: 1, type: 'pre_eclampsia', severity: 'critical', patient: 'Petit Claire', week: 28, description: 'Risque de pre-eclampsie: TA 148/95 mmHg avec proteinurie 2+', status: 'active', date: '2026-02-27', auto: true },
  { id: 2, type: 'gestational_diabetes', severity: 'warning', patient: 'Moreau Julie', week: 24, description: 'Risque de diabete gestationnel: glycemie a jeun 1.05 g/L (seuil: 0.92 g/L)', status: 'active', date: '2026-02-26', auto: true },
  { id: 3, type: 'iugr', severity: 'warning', patient: 'Bernard Lea', week: 32, description: 'Risque RCIU: poids foetal 1050g a SA 32 (< 10e percentile)', status: 'acknowledged', date: '2026-02-25', auto: true },
  { id: 4, type: 'anomaly', severity: 'critical', patient: 'Leroy Emma', week: 36, description: 'Score APGAR bas a 1min: 5/10. Evaluation neonatale immediate requise.', status: 'active', date: '2026-02-20', auto: true },
  { id: 5, type: 'postpartum_depression', severity: 'warning', patient: 'Martin Sophie', week: 0, description: 'Score Edinburgh: 14/30 (seuil: 13). Risque de depression postnatale.', status: 'active', date: '2026-02-26', auto: true },
  { id: 6, type: 'anomaly', severity: 'info', patient: 'Dupont Marie', week: 22, description: 'Pyelectasie bilaterale detectee a l\'echographie morphologique. Surveillance recommandee.', status: 'resolved', date: '2026-02-15', auto: true },
];

const severityIcons = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const typeLabels: Record<string, string> = {
  pre_eclampsia: 'Pre-eclampsie',
  gestational_diabetes: 'Diabete gestationnel',
  iugr: 'RCIU',
  preterm_labor: 'Travail premature',
  placenta_previa: 'Placenta praevia',
  rh_incompatibility: 'Incompatibilite Rh',
  anomaly: 'Anomalie',
  postpartum_depression: 'Depression post-partum',
};

export function AlertsPage() {
  const activeAlerts = mockAlerts.filter((a) => a.status === 'active');
  const otherAlerts = mockAlerts.filter((a) => a.status !== 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Bell className="w-7 h-7 text-brand-500" />
          Alertes cliniques
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Gestion des alertes automatiques et manuelles
        </p>
      </div>

      {/* Active Alerts */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Alertes actives ({activeAlerts.length})
        </h2>
        <div className="space-y-3">
          {activeAlerts.map((alert) => {
            const Icon = severityIcons[alert.severity as keyof typeof severityIcons];
            return (
              <div
                key={alert.id}
                className={`card p-4 border-l-4 ${
                  alert.severity === 'critical'
                    ? 'border-l-red-500'
                    : alert.severity === 'warning'
                      ? 'border-l-amber-500'
                      : 'border-l-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase ${
                          alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                        }`}>
                          {typeLabels[alert.type]}
                        </span>
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                          {alert.patient} {alert.week > 0 ? `- SA ${alert.week}` : ''}
                        </span>
                        {alert.auto && (
                          <span className="text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] px-2 py-0.5 rounded">
                            Auto
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-primary)]">{alert.description}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{alert.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="btn-secondary text-xs px-3 py-1.5">
                      Acquitter
                    </button>
                    <button className="btn-primary text-xs px-3 py-1.5">
                      Resoudre
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Acknowledged / Resolved */}
      {otherAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Historique
          </h2>
          <div className="space-y-2">
            {otherAlerts.map((alert) => (
              <div key={alert.id} className="card p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-[var(--color-text-primary)]">
                        {typeLabels[alert.type]} - {alert.patient}
                      </span>
                      <p className="text-xs text-[var(--color-text-tertiary)]">{alert.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs ${alert.status === 'resolved' ? 'badge-success' : 'badge-info'}`}>
                    {alert.status === 'resolved' ? 'Resolu' : 'Acquitte'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
