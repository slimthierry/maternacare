import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Loader2, ChevronLeft, ChevronRight, List, Download, Printer, CheckCircle2 } from 'lucide-react';
import type { Patient, PaginatedResponse } from '../types';
import { patients } from '../services/api';

const today = new Date().toISOString().split('T')[0];

export function PatientsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<PaginatedResponse<Patient> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    ipp: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    blood_type: '',
    rh_factor: '',
    phone: '',
    emergency_contact: '',
    allergies: '',
  });

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await patients.list(page, 20, searchTerm || undefined);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(fetchPatients, searchTerm ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchPatients, searchTerm]);

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ ipp: '', first_name: '', last_name: '', date_of_birth: '', blood_type: '', rh_factor: '', phone: '', emergency_contact: '', allergies: '' });
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload: Record<string, unknown> = {
        ipp: formData.ipp,
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
      };
      if (formData.blood_type) payload.blood_type = formData.blood_type;
      if (formData.rh_factor) payload.rh_factor = formData.rh_factor;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.emergency_contact) payload.emergency_contact = formData.emergency_contact;
      if (formData.allergies.trim()) payload.allergies = formData.allergies.split(',').map((a) => a.trim()).filter(Boolean);

      await patients.create(payload as Partial<Patient>);
      resetForm();
      setView('list');
      setPage(1);
      setSuccess('Patiente enregistree avec succes');
      setTimeout(() => setSuccess(''), 4000);
      fetchPatients();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-500" />
            Registre des patientes
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} patientes enregistrees` : 'Gestion des dossiers patientes'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {view === 'list' && (
            <>
              <button
                onClick={() => window.print()}
                className="btn-secondary flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />Imprimer
              </button>
              <button
                onClick={() => patients.exportCsv().catch(() => setError('Erreur lors de l\'export'))}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />Export CSV
              </button>
            </>
          )}
          <button
            onClick={() => { setView(view === 'list' ? 'form' : 'list'); resetForm(); }}
            className="btn-primary flex items-center gap-2"
          >
            {view === 'list' ? (
              <><Plus className="w-4 h-4" />Nouvelle patiente</>
            ) : (
              <><List className="w-4 h-4" />Voir la liste</>
            )}
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
            Enregistrer une patiente
          </h3>
          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">IPP *</label>
              <input type="text" required maxLength={50} value={formData.ipp} onChange={(e) => handleInputChange('ipp', e.target.value)} className="input-field w-full" placeholder="IPP-2026-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Nom *</label>
              <input type="text" required maxLength={100} value={formData.last_name} onChange={(e) => handleInputChange('last_name', e.target.value)} className="input-field w-full" placeholder="Nom de famille" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Prenom *</label>
              <input type="text" required maxLength={100} value={formData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} className="input-field w-full" placeholder="Prenom" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Date de naissance *</label>
              <input type="date" required max={today} value={formData.date_of_birth} onChange={(e) => handleInputChange('date_of_birth', e.target.value)} className="input-field w-full" />
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
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Telephone</label>
              <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="input-field w-full" placeholder="+229 97 00 00 01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Contact d'urgence</label>
              <input type="tel" value={formData.emergency_contact} onChange={(e) => handleInputChange('emergency_contact', e.target.value)} className="input-field w-full" placeholder="+229 97 00 00 02" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Allergies</label>
              <input type="text" value={formData.allergies} onChange={(e) => handleInputChange('allergies', e.target.value)} className="input-field w-full" placeholder="penicilline, latex (separer par virgule)" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => { setView('list'); resetForm(); }} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer la patiente
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card p-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
              <input
                type="text"
                placeholder="Rechercher par IPP, nom ou prenom..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="input-field w-full pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button onClick={fetchPatients} className="btn-secondary mt-3 text-sm">Reessayer</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border-primary)]">
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">IPP</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Nom</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Prenom</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date de naissance</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Groupe sanguin</th>
                      <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Telephone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.map((patient) => (
                      <tr key={patient.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-brand-600 dark:text-brand-400">{patient.ipp}</td>
                        <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{patient.last_name}</td>
                        <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.first_name}</td>
                        <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.date_of_birth}</td>
                        <td className="py-3 px-4">
                          {patient.blood_type && (
                            <span className="badge-info">{patient.blood_type}{patient.rh_factor}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data && data.items.length === 0 && (
                <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                  Aucune patiente trouvee
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border-secondary)]">
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    Page {page} sur {totalPages} ({data?.total} resultats)
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors">
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
