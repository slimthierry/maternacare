import { useState } from 'react';
import { Stethoscope, Plus, Calendar } from 'lucide-react';

export function ConsultationsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-brand-500" />
            Consultations prenatales
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Enregistrement et suivi des consultations
          </p>
        </div>
        <button
          onClick={() => setView(view === 'list' ? 'form' : 'list')}
          className="btn-primary flex items-center gap-2"
        >
          {view === 'list' ? (
            <>
              <Plus className="w-4 h-4" />
              Nouvelle consultation
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Voir historique
            </>
          )}
        </button>
      </div>

      {view === 'form' ? (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
            Enregistrer une consultation
          </h3>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Date</label>
              <input type="date" className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Semaine d'amenorrhee</label>
              <input type="number" min="1" max="45" className="input-field w-full" placeholder="SA" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Type</label>
              <select className="input-field w-full">
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="specialist">Specialiste</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Poids (kg)</label>
              <input type="number" step="0.1" className="input-field w-full" placeholder="kg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">TA systolique (mmHg)</label>
              <input type="number" className="input-field w-full" placeholder="mmHg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">TA diastolique (mmHg)</label>
              <input type="number" className="input-field w-full" placeholder="mmHg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Hauteur uterine (cm)</label>
              <input type="number" step="0.5" className="input-field w-full" placeholder="cm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">RCF (bpm)</label>
              <input type="number" className="input-field w-full" placeholder="bpm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Glycemie (g/L)</label>
              <input type="number" step="0.01" className="input-field w-full" placeholder="g/L" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Proteinurie</label>
              <select className="input-field w-full">
                <option value="negative">Negative</option>
                <option value="trace">Traces</option>
                <option value="1+">1+</option>
                <option value="2+">2+</option>
                <option value="3+">3+</option>
                <option value="4+">4+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Oedemes</label>
              <select className="input-field w-full">
                <option value="none">Aucun</option>
                <option value="mild">Legers</option>
                <option value="moderate">Moderes</option>
                <option value="severe">Severes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Prochain RDV</label>
              <input type="date" className="input-field w-full" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Notes</label>
              <textarea rows={3} className="input-field w-full" placeholder="Observations cliniques..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setView('list')} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                Enregistrer la consultation
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-primary)]">
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Patiente</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">SA</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">TA</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Poids</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">RCF</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Praticien</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '2026-02-26', patient: 'Dupont Marie', week: 25, bp: '120/75', weight: '68.5', hr: '145', type: 'routine', pract: 'Dr. Martin' },
                  { date: '2026-02-25', patient: 'Martin Sophie', week: 32, bp: '118/72', weight: '74.2', hr: '140', type: 'routine', pract: 'SF Leroy' },
                  { date: '2026-02-24', patient: 'Petit Claire', week: 28, bp: '142/92', weight: '71.0', hr: '148', type: 'urgent', pract: 'Dr. Martin' },
                  { date: '2026-02-23', patient: 'Moreau Julie', week: 20, bp: '115/68', weight: '62.8', hr: '152', type: 'routine', pract: 'SF Dubois' },
                ].map((c, i) => (
                  <tr key={i} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                    <td className="py-3 px-4 text-[var(--color-text-primary)]">{c.date}</td>
                    <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{c.patient}</td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{c.week}</td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{c.bp}</td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{c.weight} kg</td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{c.hr} bpm</td>
                    <td className="py-3 px-4">
                      <span className={c.type === 'urgent' ? 'badge-warning' : 'badge-info'}>{c.type === 'urgent' ? 'Urgent' : 'Routine'}</span>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{c.pract}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
