import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Search, Download, Upload, RefreshCw, FileSpreadsheet, Filter } from 'lucide-react';
import { depenseService, employeeService } from '../../services/api';

const C = {
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  ink: "#1A1D2E",
  inkSoft: "#6B7280",
  inkLight: "#9CA3AF",
  teal: "#0F766E",
  tealLight: "#14B8A6",
  gold: "#B45309",
  goldLight: "#D97706",
  border: "#E5E7EB",
  danger: "#DC2626",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
};

const Card = ({ children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, boxShadow: C.shadow, ...style }}>{children}</div>
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

function DepensesSection() {
  const [depenses, setDepenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmp, setSelectedEmp] = useState("all");
  const [selectedCat, setSelectedCat] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingDepense, setEditingDepense] = useState(null);
  const [formData, setFormData] = useState({
    employee: '', date: '', categorie: '', description: '', montant: 0, mode_paiement: 'ESPECES', justificatif: ''
  });

  const categories = ['MATERIEL', 'MISSION', 'SANTE', 'EVENEMENT', 'FOURNITURE', 'AUTRE'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [depRes, empRes] = await Promise.all([
        depenseService.getAll(),
        employeeService.getAll()
      ]);
      
      let depensesData = [];
      if (Array.isArray(depRes.data)) {
        depensesData = depRes.data;
      } else if (depRes.data && depRes.data.results) {
        depensesData = depRes.data.results;
      }
      
      let employeesData = [];
      if (Array.isArray(empRes.data)) {
        employeesData = empRes.data;
      } else if (empRes.data && empRes.data.results) {
        employeesData = empRes.data.results;
      }
      
      setDepenses(depensesData);
      setEmployees(employeesData);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const empName = (id) => {
    const e = employees.find(x => x.id === id);
    return e ? `${e.prenom} ${e.nom}` : '—';
  };

  const filtered = depenses.filter(d => {
    const matchSearch = (d.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (d.categorie || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchEmp = selectedEmp === 'all' || d.employee === selectedEmp;
    const matchCat = selectedCat === 'all' || d.categorie === selectedCat;
    return matchSearch && matchEmp && matchCat;
  });

  const totalGlobal = filtered.reduce((s, d) => s + Number(d.montant || 0), 0);

  // Export CSV
  const exportCSV = () => {
    const headers = ['Date', 'Employé', 'Catégorie', 'Description', 'Montant', 'Paiement', 'Justificatif'];
    const rows = filtered.map(d => [
      d.date,
      empName(d.employee),
      d.categorie,
      d.description,
      Number(d.montant || 0),
      d.mode_paiement,
      d.justificatif || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `depenses_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`Import du fichier: ${file.name} (simulation)`);
    }
  };

  const handleOpenModal = (depense = null) => {
    if (depense) {
      setEditingDepense(depense);
      setFormData({
        employee: depense.employee || '',
        date: depense.date || '',
        categorie: depense.categorie || '',
        description: depense.description || '',
        montant: Number(depense.montant) || 0,
        mode_paiement: depense.mode_paiement || 'ESPECES',
        justificatif: depense.justificatif || ''
      });
    } else {
      setEditingDepense(null);
      setFormData({
        employee: '', date: '', categorie: '', description: '', montant: 0, mode_paiement: 'ESPECES', justificatif: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepense(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingDepense) {
        await depenseService.update(editingDepense.id, formData);
      } else {
        await depenseService.create(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette dépense ?')) {
      try {
        await depenseService.delete(id);
        fetchData();
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>Chargement des dépenses...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <PageTitle title="Dépenses" sub={`${depenses.length} dépenses enregistrées`} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleOpenModal()}
            style={{ background: C.teal, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} /> Ajouter
          </button>
          <button 
            onClick={exportCSV}
            style={{ background: C.bg, border: `1px solid ${C.border}`, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={15} /> Exporter
          </button>
          <label style={{ background: C.bg, border: `1px solid ${C.border}`, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Upload size={15} /> Importer
            <input type="file" accept=".csv,.xlsx" onChange={importCSV} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Card style={{ background: `${C.danger}08`, borderColor: C.danger }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Nombre de dépenses</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.danger }}>{filtered.length}</div>
        </Card>
        <Card style={{ background: `${C.gold}08`, borderColor: C.gold }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Montant total</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>{fmt(totalGlobal)}</div>
        </Card>
        <Card style={{ background: `#7C3AED08`, borderColor: '#7C3AED' }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Moyenne</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#7C3AED' }}>{filtered.length ? fmt(totalGlobal / filtered.length) : '0 FCFA'}</div>
        </Card>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.inkSoft }} />
          <input
            type="text"
            placeholder="Rechercher une dépense..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 35px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
          />
        </div>
        <select
          value={selectedEmp}
          onChange={(e) => setSelectedEmp(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
        >
          <option value="all">Tous les employés</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
        </select>
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
        >
          <option value="all">Toutes les catégories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={fetchData} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Employé</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Catégorie</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Description</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.danger, textTransform: 'uppercase' }}>Montant</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Paiement</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Justificatif</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{d.date}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{empName(d.employee)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>
                    <span style={{ background: C.bg, padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>{d.categorie}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{d.description}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: C.danger, fontFamily: 'monospace' }}>{fmtShort(d.montant)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{d.mode_paiement}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{d.justificatif || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button onClick={() => handleOpenModal(d)} style={{ background: 'none', border: 'none', color: C.teal, cursor: 'pointer', marginRight: 8 }}>✏️</button>
                    <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center', color: C.inkSoft }}>Aucune dépense trouvée</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: C.bg, fontWeight: 700, borderTop: `2px solid ${C.border}` }}>
                <td colSpan="4" style={{ padding: '12px 16px', textAlign: 'right' }}>Total général</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 15, color: C.danger, fontFamily: 'monospace' }}>{fmt(totalGlobal)}</td>
                <td colSpan="3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: 0 }}>{editingDepense ? 'Modifier' : 'Nouvelle'} dépense</h3>
              </div>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.inkSoft, fontSize: 20, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Employé *</label>
                <select name="employee" value={formData.employee} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
                  <option value="">Sélectionner</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Catégorie *</label>
                <select name="categorie" value={formData.categorie} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
                  <option value="">Sélectionner</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Montant (FCFA) *</label>
                <input type="number" name="montant" value={formData.montant} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description *</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Mode de paiement</label>
                <select name="mode_paiement" value={formData.mode_paiement} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
                  <option value="ESPECES">Espèces</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CHEQUE">Chèque</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Justificatif</label>
                <input type="text" name="justificatif" value={formData.justificatif} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
              <button onClick={handleCloseModal} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleSubmit} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{editingDepense ? 'Modifier' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepensesSection;
