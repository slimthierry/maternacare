import { Baby, Plus } from 'lucide-react';

const mockNewborns = [
  { id: 1, name: 'Dupont Lucas', sex: 'M', weight: 3250, height: 50, hc: 34.5, bloodType: 'A+', apgar1: 9, apgar5: 10, apgar10: 10, resuscitation: false, nicu: false, date: '2026-02-25' },
  { id: 2, name: 'Martin Louise', sex: 'F', weight: 2980, height: 48, hc: 33.0, bloodType: 'O-', apgar1: 8, apgar5: 9, apgar10: 10, resuscitation: false, nicu: false, date: '2026-02-24' },
  { id: 3, name: 'Bernard Noa', sex: 'M', weight: 3450, height: 51, hc: 35.0, bloodType: 'B+', apgar1: 10, apgar5: 10, apgar10: 10, resuscitation: false, nicu: false, date: '2026-02-22' },
  { id: 4, name: 'Leroy Alice', sex: 'F', weight: 2100, height: 44, hc: 31.0, bloodType: 'A-', apgar1: 5, apgar5: 7, apgar10: 8, resuscitation: true, nicu: true, date: '2026-02-20' },
];

export function NewbornsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Baby className="w-7 h-7 text-brand-500" />
            Registre des nouveau-nes
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Gestion des dossiers nouveau-nes et statistiques vitales
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Enregistrer un nouveau-ne
        </button>
      </div>

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
              {mockNewborns.map((nb) => (
                <tr key={nb.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                  <td className="py-3 px-4 text-[var(--color-text-primary)]">{nb.date}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{nb.name}</td>
                  <td className="py-3 px-4">
                    <span className={nb.sex === 'M' ? 'badge-info' : 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200 text-xs font-medium px-2.5 py-0.5 rounded-full'}>
                      {nb.sex === 'M' ? 'Garcon' : 'Fille'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.weight}g</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.height} cm</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.hc} cm</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.bloodType}</td>
                  <td className="py-3 px-4 font-mono text-sm">
                    <span className={nb.apgar1 < 7 ? 'text-red-500 font-bold' : 'text-[var(--color-text-primary)]'}>
                      {nb.apgar1}
                    </span>
                    /
                    <span className={nb.apgar5 < 7 ? 'text-red-500 font-bold' : 'text-[var(--color-text-primary)]'}>
                      {nb.apgar5}
                    </span>
                    /
                    <span className="text-[var(--color-text-primary)]">{nb.apgar10}</span>
                  </td>
                  <td className="py-3 px-4">
                    {nb.resuscitation ? (
                      <span className="badge-critical">Oui</span>
                    ) : (
                      <span className="badge-success">Non</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {nb.nicu ? (
                      <span className="badge-warning">Oui</span>
                    ) : (
                      <span className="badge-success">Non</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
