import { useState } from 'react';
import { Users, Plus, Search } from 'lucide-react';

const mockPatients = [
  { id: 1, ipp: 'IPP-2024-001', firstName: 'Marie', lastName: 'Dupont', dob: '1990-05-15', bloodType: 'A+', phone: '+33 6 12 34 56 78', pregnancies: 2 },
  { id: 2, ipp: 'IPP-2024-002', firstName: 'Sophie', lastName: 'Martin', dob: '1988-03-22', bloodType: 'O-', phone: '+33 6 98 76 54 32', pregnancies: 1 },
  { id: 3, ipp: 'IPP-2024-003', firstName: 'Lea', lastName: 'Bernard', dob: '1995-11-08', bloodType: 'B+', phone: '+33 6 45 67 89 01', pregnancies: 1 },
  { id: 4, ipp: 'IPP-2024-004', firstName: 'Claire', lastName: 'Petit', dob: '1992-07-30', bloodType: 'AB+', phone: '+33 6 23 45 67 89', pregnancies: 3 },
  { id: 5, ipp: 'IPP-2024-005', firstName: 'Julie', lastName: 'Moreau', dob: '1993-01-18', bloodType: 'A-', phone: '+33 6 67 89 01 23', pregnancies: 1 },
];

export function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = mockPatients.filter(
    (p) =>
      p.ipp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-500" />
            Registre des patientes
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Gestion des dossiers patientes
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle patiente
        </button>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Rechercher par IPP, nom ou prenom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
        </div>

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
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Grossesses</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-brand-600 dark:text-brand-400">{patient.ipp}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{patient.lastName}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.firstName}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.dob}</td>
                  <td className="py-3 px-4">
                    <span className="badge-info">{patient.bloodType}</span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.phone}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.pregnancies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-tertiary)]">
            Aucune patiente trouvee
          </div>
        )}
      </div>
    </div>
  );
}
