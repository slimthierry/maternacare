import { useState, useEffect } from 'react';
import { Stethoscope, Plus, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Consultation, PaginatedResponse } from '../types';
import { consultations } from '../services/api';

const typeLabels: Record<string, string> = {
  routine: 'Routine',
  urgent: 'Urgent',
  specialist: 'Specialiste',
};

export function ConsultationsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<PaginatedResponse<Consultation> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    pregnancy_id: '',
    date: '',
    gestational_week: '',
    consultation_type: 'routine' as 'routine' | 'urgent' | 'specialist',
    weight_kg: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    uterine_height_cm: '',
    fetal_heart_rate: '',
    glycemia: '',
    proteinuria: 'negative' as string,
    edema: 'none' as string,
    next_appointment: '',
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    consultations.list(page)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload: Record<string, unknown> = {
        pregnancy_id: Number(formData.pregnancy_id),
        date: formData.date,
        gestational_week: Number(formData.gestational_week),
        consultation_type: formData.consultation_type,
        practitioner_id: 1,
      };
      if (formData.weight_kg) payload.weight_kg = Number(formData.weight_kg);
      if (formData.blood_pressure_systolic) payload.blood_pressure_systolic = Number(formData.blood_pressure_systolic);
      if (formData.blood_pressure_diastolic) payload.blood_pressure_diastolic = Number(formData.blood_pressure_diastolic);
      if (formData.uterine_height_cm) payload.uterine_height_cm = Number(formData.uterine_height_cm);
      if (formData.fetal_heart_rate) payload.fetal_heart_rate = Number(formData.fetal_heart_rate);
      if (formData.glycemia) payload.glycemia = Number(formData.glycemia);
      if (formData.proteinuria !== 'negative') payload.proteinuria = formData.proteinuria;
      if (formData.edema !== 'none') payload.edema = formData.edema;
      if (formData.next_appointment) payload.next_appointment = formData.next_appointment;
      if (formData.notes) payload.notes = formData.notes;

      await consultations.create(payload as Partial<Consultation>);
      setView('list');
      setPage(1);
      fetchData();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

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
          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">ID Grossesse</label>
              <input
                type="number"
                min="1"
                required
                value={formData.pregnancy_id}
                onChange={(e) => handleInputChange('pregnancy_id', e.target.value)}
                className="input-field w-full"
                placeholder="ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Semaine d'amenorrhee</label>
              <input
                type="number"
                min="1"
                max="45"
                required
                value={formData.gestational_week}
                onChange={(e) => handleInputChange('gestational_week', e.target.value)}
                className="input-field w-full"
                placeholder="SA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Type</label>
              <select
                value={formData.consultation_type}
                onChange={(e) => handleInputChange('consultation_type', e.target.value)}
                className="input-field w-full"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="specialist">Specialiste</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Poids (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                className="input-field w-full"
                placeholder="kg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">TA systolique (mmHg)</label>
              <input
                type="number"
                value={formData.blood_pressure_systolic}
                onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                className="input-field w-full"
                placeholder="mmHg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">TA diastolique (mmHg)</label>
              <input
                type="number"
                value={formData.blood_pressure_diastolic}
                onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                className="input-field w-full"
                placeholder="mmHg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Hauteur uterine (cm)</label>
              <input
                type="number"
                step="0.5"
                value={formData.uterine_height_cm}
                onChange={(e) => handleInputChange('uterine_height_cm', e.target.value)}
                className="input-field w-full"
                placeholder="cm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">RCF (bpm)</label>
              <input
                type="number"
                value={formData.fetal_heart_rate}
                onChange={(e) => handleInputChange('fetal_heart_rate', e.target.value)}
                className="input-field w-full"
                placeholder="bpm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Glycemie (g/L)</label>
              <input
                type="number"
                step="0.01"
                value={formData.glycemia}
                onChange={(e) => handleInputChange('glycemia', e.target.value)}
                className="input-field w-full"
                placeholder="g/L"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Proteinurie</label>
              <select
                value={formData.proteinuria}
                onChange={(e) => handleInputChange('proteinuria', e.target.value)}
                className="input-field w-full"
              >
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
              <select
                value={formData.edema}
                onChange={(e) => handleInputChange('edema', e.target.value)}
                className="input-field w-full"
              >
                <option value="none">Aucun</option>
                <option value="mild">Legers</option>
                <option value="moderate">Moderes</option>
                <option value="severe">Severes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Prochain RDV</label>
              <input
                type="date"
                value={formData.next_appointment}
                onChange={(e) => handleInputChange('next_appointment', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="input-field w-full"
                placeholder="Observations cliniques..."
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setView('list')} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer la consultation
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button onClick={fetchData} className="btn-secondary mt-3 text-sm">Reessayer</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border-primary)]">
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Grossesse</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">SA</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">TA</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Poids</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">RCF</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Praticien</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.map((c) => (
                      <tr key={c.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                        <td className="py-3 px-4 text-[var(--color-text-primary)]">{c.date}</td>
                        <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">#{c.pregnancy_id}</td>
                        <td className="py-3 px-4 text-[var(--color-text-secondary)]">{c.gestational_week}</td>
                        <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                          {c.blood_pressure_systolic && c.blood_pressure_diastolic
                            ? `${c.blood_pressure_systolic}/${c.blood_pressure_diastolic}`
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                          {c.weight_kg ? `${c.weight_kg} kg` : '-'}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                          {c.fetal_heart_rate ? `${c.fetal_heart_rate} bpm` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={c.consultation_type === 'urgent' ? 'badge-warning' : 'badge-info'}>
                            {typeLabels[c.consultation_type]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-secondary)]">#{c.practitioner_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data && data.items.length === 0 && (
                <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                  Aucune consultation trouvee
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border-secondary)]">
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    Page {page} sur {totalPages} ({data?.total} resultats)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
