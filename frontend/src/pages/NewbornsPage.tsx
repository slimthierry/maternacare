import { useState, useEffect } from 'react';
import { Baby, Plus, List, Loader2, ChevronLeft, ChevronRight, Download, Printer } from 'lucide-react';
import type { Newborn, Delivery, PaginatedResponse } from '../types';
import { newborns, deliveries } from '../services/api';

export function NewbornsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<PaginatedResponse<Newborn> | null>(null);
  const [deliveryList, setDeliveryList] = useState<Delivery[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    delivery_id: '',
    first_name: '',
    sex: 'F',
    weight_g: '',
    height_cm: '',
    head_circumference_cm: '',
    blood_type: '',
    rh_factor: '',
    apgar_1min: '',
    apgar_5min: '',
    apgar_10min: '',
    resuscitation_needed: 'false',
    nicu_admission: 'false',
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    newborns.list(page)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  useEffect(() => {
    if (view === 'form') {
      deliveries.list(1, 100).then((res) => setDeliveryList(res.items)).catch(() => {});
    }
  }, [view]);

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
        delivery_id: Number(formData.delivery_id),
        sex: formData.sex,
        weight_g: Number(formData.weight_g),
        resuscitation_needed: formData.resuscitation_needed === 'true',
        nicu_admission: formData.nicu_admission === 'true',
      };
      if (formData.first_name) payload.first_name = formData.first_name;
      if (formData.height_cm) payload.height_cm = Number(formData.height_cm);
      if (formData.head_circumference_cm) payload.head_circumference_cm = Number(formData.head_circumference_cm);
      if (formData.blood_type) payload.blood_type = formData.blood_type;
      if (formData.rh_factor) payload.rh_factor = formData.rh_factor;
      if (formData.apgar_1min) payload.apgar_1min = Number(formData.apgar_1min);
      if (formData.apgar_5min) payload.apgar_5min = Number(formData.apgar_5min);
      if (formData.apgar_10min) payload.apgar_10min = Number(formData.apgar_10min);
      if (formData.notes) payload.notes = formData.notes;

      await newborns.create(payload as Partial<Newborn>);
      setView('list');
      setPage(1);
      fetchData();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  if (view === 'list' && loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (view === 'list' && error && !data) return <div className="card p-8 text-center"><p className="text-red-500">{error}</p><button onClick={fetchData} className="btn-secondary mt-3 text-sm">Reessayer</button></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Baby className="w-7 h-7 text-brand-500" />
            Registre des nouveau-nes
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Gestion des dossiers nouveau-nes et statistiques vitales</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {view === 'list' && (
            <>
              <button onClick={() => newborns.exportCsv()} className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />CSV
              </button>
              <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
                <Printer className="w-4 h-4" />Imprimer
              </button>
            </>
          )}
          <button onClick={() => setView(view === 'list' ? 'form' : 'list')} className="btn-primary flex items-center gap-2">
            {view === 'list' ? <><Plus className="w-4 h-4" />Enregistrer un nouveau-ne</> : <><List className="w-4 h-4" />Voir la liste</>}
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Enregistrer un nouveau-ne</h3>
          {submitError && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{submitError}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Accouchement *</label>
              <select required value={formData.delivery_id} onChange={(e) => handleInputChange('delivery_id', e.target.value)} className="input-field w-full">
                <option value="">-- Selectionner --</option>
                {deliveryList.map((d) => <option key={d.id} value={d.id}>#{d.id} - {d.date} (SA {d.gestational_week})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Prenom</label>
              <input type="text" maxLength={100} value={formData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} className="input-field w-full" placeholder="Prenom du bebe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Sexe *</label>
              <select value={formData.sex} onChange={(e) => handleInputChange('sex', e.target.value)} className="input-field w-full">
                <option value="F">Fille</option>
                <option value="M">Garcon</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Poids (g) *</label>
              <input type="number" min="200" max="7000" required value={formData.weight_g} onChange={(e) => handleInputChange('weight_g', e.target.value)} className="input-field w-full" placeholder="g" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Taille (cm)</label>
              <input type="number" step="0.1" min={20} max={65} value={formData.height_cm} onChange={(e) => handleInputChange('height_cm', e.target.value)} className="input-field w-full" placeholder="cm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">PC (cm)</label>
              <input type="number" step="0.1" min={20} max={45} value={formData.head_circumference_cm} onChange={(e) => handleInputChange('head_circumference_cm', e.target.value)} className="input-field w-full" placeholder="cm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Groupe sanguin</label>
              <select value={formData.blood_type} onChange={(e) => handleInputChange('blood_type', e.target.value)} className="input-field w-full">
                <option value="">-- Choisir --</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Rhesus</label>
              <select value={formData.rh_factor} onChange={(e) => handleInputChange('rh_factor', e.target.value)} className="input-field w-full">
                <option value="">-- Choisir --</option>
                <option value="positive">Positif (+)</option>
                <option value="negative">Negatif (-)</option>
              </select>
            </div>
            <div className="border-t border-[var(--color-border-secondary)] pt-4 md:col-span-2 lg:col-span-3">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Score APGAR</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">APGAR 1 min</label>
                  <input type="number" min="0" max="10" value={formData.apgar_1min} onChange={(e) => handleInputChange('apgar_1min', e.target.value)} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">APGAR 5 min</label>
                  <input type="number" min="0" max="10" value={formData.apgar_5min} onChange={(e) => handleInputChange('apgar_5min', e.target.value)} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">APGAR 10 min</label>
                  <input type="number" min="0" max="10" value={formData.apgar_10min} onChange={(e) => handleInputChange('apgar_10min', e.target.value)} className="input-field w-full" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Reanimation necessaire</label>
              <select value={formData.resuscitation_needed} onChange={(e) => handleInputChange('resuscitation_needed', e.target.value)} className="input-field w-full">
                <option value="false">Non</option>
                <option value="true">Oui</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Admission USIN</label>
              <select value={formData.nicu_admission} onChange={(e) => handleInputChange('nicu_admission', e.target.value)} className="input-field w-full">
                <option value="false">Non</option>
                <option value="true">Oui</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Notes</label>
              <textarea rows={3} value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} className="input-field w-full" placeholder="Observations neonatales..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setView('list')} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer le nouveau-ne
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
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Nom</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Sexe</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Poids</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Taille</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">PC</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Groupe</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">APGAR 1'/5'/10'</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Reanimation</th>
                  <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">USIN</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((nb) => (
                  <tr key={nb.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                    <td className="py-3 px-4 text-[var(--color-text-primary)]">{nb.created_at?.split('T')[0] ?? '-'}</td>
                    <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{nb.first_name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={nb.sex === 'M' ? 'badge-info' : 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200 text-xs font-medium px-2.5 py-0.5 rounded-full'}>
                        {nb.sex === 'M' ? 'Garcon' : 'Fille'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.weight_g}g</td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.height_cm ? `${nb.height_cm} cm` : '-'}</td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.head_circumference_cm ? `${nb.head_circumference_cm} cm` : '-'}</td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.blood_type ? `${nb.blood_type}${nb.rh_factor || ''}` : '-'}</td>
                    <td className="py-3 px-4 font-mono text-sm">
                      <span className={nb.apgar_1min != null && nb.apgar_1min < 7 ? 'text-red-500 font-bold' : 'text-[var(--color-text-primary)]'}>{nb.apgar_1min ?? '-'}</span>
                      /
                      <span className={nb.apgar_5min != null && nb.apgar_5min < 7 ? 'text-red-500 font-bold' : 'text-[var(--color-text-primary)]'}>{nb.apgar_5min ?? '-'}</span>
                      /
                      <span className="text-[var(--color-text-primary)]">{nb.apgar_10min ?? '-'}</span>
                    </td>
                    <td className="py-3 px-4">{nb.resuscitation_needed ? <span className="badge-critical">Oui</span> : <span className="badge-success">Non</span>}</td>
                    <td className="py-3 px-4">{nb.nicu_admission ? <span className="badge-warning">Oui</span> : <span className="badge-success">Non</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.items.length === 0 && <div className="text-center py-12 text-[var(--color-text-tertiary)]">Aucun nouveau-ne trouve</div>}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border-secondary)]">
              <p className="text-sm text-[var(--color-text-tertiary)]">Page {page} sur {totalPages} ({data?.total} resultats)</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
