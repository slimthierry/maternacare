import { useState } from 'react';
import { Shield, Search } from 'lucide-react';

const mockAuditLogs = [
  { id: 100, user: 'Dr. Martin', action: 'POST /api/v1/consultations/', entity: 'consultations', entityId: 45, details: 'status=201 duration=125ms', ip: '192.168.1.10', timestamp: '2026-02-27 14:32:15' },
  { id: 99, user: 'SF Leroy', action: 'GET /api/v1/pregnancies/12', entity: 'pregnancies', entityId: 12, details: 'status=200 duration=45ms', ip: '192.168.1.15', timestamp: '2026-02-27 14:30:02' },
  { id: 98, user: 'Dr. Martin', action: 'PUT /api/v1/alerts/8/acknowledge', entity: 'alerts', entityId: 8, details: 'status=200 duration=89ms', ip: '192.168.1.10', timestamp: '2026-02-27 14:25:41' },
  { id: 97, user: 'Admin', action: 'POST /api/v1/auth/register', entity: 'auth', entityId: null, details: 'status=201 duration=234ms', ip: '192.168.1.1', timestamp: '2026-02-27 14:20:00' },
  { id: 96, user: 'Dr. Bernard', action: 'POST /api/v1/ultrasounds/', entity: 'ultrasounds', entityId: 23, details: 'status=201 duration=156ms', ip: '192.168.1.20', timestamp: '2026-02-27 14:15:30' },
  { id: 95, user: 'SF Dubois', action: 'POST /api/v1/postpartum/', entity: 'postpartum', entityId: 11, details: 'status=201 duration=98ms', ip: '192.168.1.18', timestamp: '2026-02-27 14:10:12' },
  { id: 94, user: 'Dr. Martin', action: 'GET /api/v1/dashboard/', entity: 'dashboard', entityId: null, details: 'status=200 duration=312ms', ip: '192.168.1.10', timestamp: '2026-02-27 14:05:00' },
  { id: 93, user: 'Dr. Martin', action: 'POST /api/v1/deliveries/', entity: 'deliveries', entityId: 7, details: 'status=201 duration=178ms', ip: '192.168.1.10', timestamp: '2026-02-27 13:55:42' },
];

export function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = !entityFilter || log.entity === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Shield className="w-7 h-7 text-brand-500" />
          Journal d'audit
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Tracabilite de toutes les actions du systeme
        </p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Rechercher par utilisateur ou action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les types</option>
            <option value="auth">Authentification</option>
            <option value="patients">Patientes</option>
            <option value="pregnancies">Grossesses</option>
            <option value="consultations">Consultations</option>
            <option value="ultrasounds">Echographies</option>
            <option value="deliveries">Accouchements</option>
            <option value="postpartum">Post-partum</option>
            <option value="newborns">Nouveau-nes</option>
            <option value="alerts">Alertes</option>
            <option value="dashboard">Dashboard</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">ID</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Timestamp</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Utilisateur</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Action</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Entite</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Details</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-[var(--color-border-secondary)]">
                  <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-tertiary)]">#{log.id}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-secondary)]">{log.timestamp}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{log.user}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-primary)]">
                    <span className={`font-bold ${
                      log.action.startsWith('POST') ? 'text-emerald-500' :
                      log.action.startsWith('PUT') ? 'text-amber-500' :
                      log.action.startsWith('DELETE') ? 'text-red-500' :
                      'text-blue-500'
                    }`}>
                      {log.action.split(' ')[0]}
                    </span>
                    {' '}{log.action.split(' ').slice(1).join(' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge-info">{log.entity}</span>
                    {log.entityId && <span className="text-xs text-[var(--color-text-tertiary)] ml-1">#{log.entityId}</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-tertiary)]">{log.details}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-tertiary)]">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
