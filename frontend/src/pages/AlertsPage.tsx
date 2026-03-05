import { useState, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Loader2 } from 'lucide-react';
import type { Alert, PaginatedResponse } from '../types';
import { alerts as alertsApi } from '../services/api';

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
  delivery_imminent: 'Accouchement imminent',
  overdue_appointment: 'RDV en retard',
};

export function AlertsPage() {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [historyAlerts, setHistoryAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [activeResult, resolvedResult] = await Promise.all([
        alertsApi.list(1, 50, 'active'),
        alertsApi.list(1, 20, 'resolved'),
      ]);
      setActiveAlerts(activeResult.items);
      setHistoryAlerts(resolvedResult.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAcknowledge = async (id: number) => {
    try {
      await alertsApi.acknowledge(id);
      fetchAlerts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await alertsApi.resolve(id);
      fetchAlerts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Active Alerts */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Alertes actives ({activeAlerts.length})
        </h2>
        {activeAlerts.length === 0 ? (
          <div className="card p-8 text-center text-[var(--color-text-tertiary)]">
            Aucune alerte active
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const Icon = severityIcons[alert.severity as keyof typeof severityIcons] || Info;
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
                            {typeLabels[alert.type] || alert.type}
                          </span>
                          {alert.auto_generated && (
                            <span className="text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] px-2 py-0.5 rounded">
                              Auto
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-primary)]">{alert.description}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{alert.detected_at || alert.created_at}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        Acquitter
                      </button>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        Resoudre
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History */}
      {historyAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Historique
          </h2>
          <div className="space-y-2">
            {historyAlerts.map((alert) => (
              <div key={alert.id} className="card p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-[var(--color-text-primary)]">
                        {typeLabels[alert.type] || alert.type}
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
