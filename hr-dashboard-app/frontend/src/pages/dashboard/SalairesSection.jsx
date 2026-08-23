import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, RefreshCw, FileSpreadsheet, Filter } from 'lucide-react';
import { employeeService } from '../../services/api';

const C = {
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  ink: "#1A1D2E",
  inkSoft: "#6B7280",
  inkLight: "#9CA3AF",
  teal: "#0F766E",
  tealLight: "#14B8A6",
  tealDark: "#0D5C56",
  gold: "#B45309",
  goldLight: "#D97706",
  border: "#E5E7EB",
  danger: "#DC2626",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
};

const Card = ({ children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, boxShadow: C.shadow, ...style }}>
    {children}
  </div>
);

const PageTitle = ({ title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: C.ink, margin: 0 }}>{title}</h2>
    {sub && <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>{sub}</p>}
  </div>
);

const fmt = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("fr-FR").format(Math.round(num)) + " FCFA";
};

const fmtShort = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("fr-FR").format(Math.round(num));
};

function SalairesSection() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAll();
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && response.data.results) {
        data = response.data.results;
      }
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des salaires');
    } finally {
      setLoading(false);
    }
  };

  const monthlyRecurring = (e) =>
    (e.salaire||0)+(e.charges||0)+(e.primes||0)+(e.transport||0)+(e.telephone||0)+(e.assurance||0)+(e.avantages||0)+(e.autres_recurrent||0);

  const filteredEmployees = employees.filter(e =>
    `${e.prenom || ''} ${e.nom || ''} ${e.poste || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = filteredEmployees.reduce((acc, e) => {
    const fields = ['salaire', 'charges', 'primes', 'transport', 'telephone', 'assurance', 'avantages', 'autres_recurrent'];
    fields.forEach(k => {
      acc[k] = (acc[k] || 0) + Number(e[k] || 0);
    });
    acc.total = (acc.total || 0) + monthlyRecurring(e);
    return acc;
  }, {});

  const cols = [
    ['salaire', 'Salaire de base'],
    ['charges', 'Charges patronales'],
    ['primes', 'Primes / Bonus'],
    ['transport', 'Transport'],
    ['telephone', 'Téléphone'],
    ['assurance', 'Assurance'],
    ['avantages', 'Avantages'],
    ['autres_recurrent', 'Autres'],
  ];

  // Export CSV
  const exportCSV = () => {
    const headers = ['Employé', 'Poste', 'Salaire', 'Charges', 'Primes', 'Transport', 'Téléphone', 'Assurance', 'Avantages', 'Autres', 'Total'];
    const rows = filteredEmployees.map(e => [
      `${e.prenom} ${e.nom}`,
      e.poste,
      Number(e.salaire || 0),
      Number(e.charges || 0),
      Number(e.primes || 0),
      Number(e.transport || 0),
      Number(e.telephone || 0),
      Number(e.assurance || 0),
      Number(e.avantages || 0),
      Number(e.autres_recurrent || 0),
      monthlyRecurring(e)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `salaires_${selectedYear}_${selectedMonth + 1}.csv`;
    link.click();
  };

  // Import CSV (simulé)
  const importCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`Import du fichier: ${file.name} (simulation)`);
      // Logique d'import à implémenter
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>Chargement des salaires...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <PageTitle title="Salaires" sub="Coûts mensuels récurrents par employé" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
          >
            {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button 
            onClick={exportCSV}
            style={{ background: C.teal, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={15} /> Exporter
          </button>
          <label style={{ background: C.bg, border: `1px solid ${C.border}`, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Upload size={15} /> Importer
            <input type="file" accept=".csv,.xlsx" onChange={importCSV} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.inkSoft }} />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 35px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
          />
        </div>
        <button onClick={fetchEmployees} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Actualiser
        </button>
        <span style={{ fontSize: 13, color: C.inkSoft }}>{filteredEmployees.length} employés</span>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Card style={{ background: `${C.teal}08`, borderColor: C.teal }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Masse salariale</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.teal }}>{fmt(totals.salaire || 0)}</div>
        </Card>
        <Card style={{ background: `${C.gold}08`, borderColor: C.gold }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Total charges</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>{fmt(totals.charges || 0)}</div>
        </Card>
        <Card style={{ background: `#7C3AED08`, borderColor: '#7C3AED' }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Total primes</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#7C3AED' }}>{fmt(totals.primes || 0)}</div>
        </Card>
        <Card style={{ background: `${C.teal}08`, borderColor: C.teal }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Coût total</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.teal }}>{fmt(totals.total || 0)}</div>
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Employé
                </th>
                {cols.map(([k,l]) => (
                  <th key={k} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {l}
                  </th>
                ))}
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(e => {
                const total = monthlyRecurring(e);
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>
                      {e.prenom} {e.nom}
                      <div style={{ fontSize: 11, color: C.inkSoft }}>{e.poste}</div>
                    </td>
                    {cols.map(([k]) => (
                      <td key={k} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>
                        {fmtShort(e[k] || 0)}
                      </td>
                    ))}
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: C.teal, fontFamily: 'monospace' }}>
                      {fmtShort(total)}
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: C.inkSoft }}>
                    Aucun employé trouvé
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: C.bg, fontWeight: 700, borderTop: `2px solid ${C.border}` }}>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>Total ({filteredEmployees.length})</td>
                {cols.map(([k]) => (
                  <td key={k} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>
                    {fmtShort(totals[k] || 0)}
                  </td>
                ))}
                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 15, fontWeight: 700, color: C.teal, fontFamily: 'monospace' }}>
                  {fmt(totals.total || 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default SalairesSection;
