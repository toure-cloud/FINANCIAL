import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Search, Download, Upload, RefreshCw, FileSpreadsheet, Calendar } from 'lucide-react';
import { formationService, employeeService } from '../../services/api';

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

function FormationsSection() {
  const [formations, setFormations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmp, setSelectedEmp] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', employee: '', date: '', organisme: '', cout: 0, deplacement: 0, hebergement: 0, autres: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formRes, empRes] = await Promise.all([
        formationService.getAll(),
        employeeService.getAll()
      ]);
      
      let formationsData = [];
      if (Array.isArray(formRes.data)) {
        formationsData = formRes.data;
      } else if (formRes.data && formRes.data.results) {
        formationsData = formRes.data.results;
      }
      
      let employeesData = [];
      if (Array.isArray(empRes.data)) {
        employeesData = empRes.data;
      } else if (empRes.data && empRes.data.results) {
        employeesData = empRes.data.results;
      }
      
      setFormations(formationsData);
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

  const totalCost = (f) => {
    if (!f) return 0;
    return Number(f.cout || 0) + Number(f.deplacement || 0) + Number(f.hebergement || 0) + Number(f.autres || 0);
  };

  const filtered = formations.filter(f => {
    const matchSearch = (f.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (f.organisme || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchEmp = selectedEmp === 'all' || f.employee === selectedEmp;
    return matchSearch && matchEmp;
  });

  const totalGlobal = filtered.reduce((s, f) => s + totalCost(f), 0);

  // Export CSV
  const exportCSV = () => {
    const headers = ['Formation', 'Employé', 'Date', 'Organisme', 'Coût', 'Déplacement', 'Hébergement', 'Autres', 'Total'];
    const rows = filtered.map(f => [
      f.nom,
      empName(f.employee),
      f.date,
      f.organisme || '',
      Number(f.cout || 0),
      Number(f.deplacement || 0),
      Number(f.hebergement || 0),
      Number(f.autres || 0),
      totalCost(f)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `formations_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`Import du fichier: ${file.name} (simulation)`);
    }
  };

  const handleOpenModal = (formation = null) => {
    if (formation) {
      setEditingFormation(formation);
      setFormData({
        nom: formation.nom || '',
        employee: formation.employee || '',
        date: formation.date || '',
        organisme: formation.organisme || '',
        cout: Number(formation.cout) || 0,
        deplacement: Number(formation.deplacement) || 0,
        hebergement: Number(formation.hebergement) || 0,
        autres: Number(formation.autres) || 0
      });
    } else {
      setEditingFormation(null);
      setFormData({
        nom: '', employee: '', date: '', organisme: '', cout: 0, deplacement: 0, hebergement: 0, autres: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFormation(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingFormation) {
        await formationService.update(editingFormation.id, formData);
      } else {
        await formationService.create(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette formation ?')) {
      try {
        await formationService.delete(id);
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
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>Chargement des formations...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <PageTitle title="Formations" sub={`${formations.length} formations enregistrées`} />
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
        <Card style={{ background: `${C.teal}08`, borderColor: C.teal }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Nombre de formations</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.teal }}>{filtered.length}</div>
        </Card>
        <Card style={{ background: `${C.gold}08`, borderColor: C.gold }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Coût total</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>{fmt(totalGlobal)}</div>
        </Card>
        <Card style={{ background: `#7C3AED08`, borderColor: '#7C3AED' }}>
          <div style={{ fontSize: 11, color: C.inkSoft }}>Coût moyen</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#7C3AED' }}>{filtered.length ? fmt(totalGlobal / filtered.length) : '0 FCFA'}</div>
        </Card>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.inkSoft }} />
          <input
            type="text"
            placeholder="Rechercher une formation..."
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
        <button onClick={fetchData} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Formation</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Employé</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Organisme</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Coût</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Déplacement</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Hébergement</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Autres</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.gold, textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const total = totalCost(f);
                return (
                  <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{f.nom}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{empName(f.employee)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{f.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{f.organisme}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>{fmtShort(f.cout)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>{fmtShort(f.deplacement)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>{fmtShort(f.hebergement)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>{fmtShort(f.autres)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: C.gold, fontFamily: 'monospace' }}>{fmtShort(total)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button onClick={() => handleOpenModal(f)} style={{ background: 'none', border: 'none', color: C.teal, cursor: 'pointer', marginRight: 8 }}>✏️</button>
                      <button onClick={() => handleDelete(f.id)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="10" style={{ padding: 40, textAlign: 'center', color: C.inkSoft }}>Aucune formation trouvée</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: C.bg, fontWeight: 700, borderTop: `2px solid ${C.border}` }}>
                <td colSpan="8" style={{ padding: '12px 16px', textAlign: 'right' }}>Total général</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 15, color: C.gold, fontFamily: 'monospace' }}>{fmt(totalGlobal)}</td>
                <td></td>
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
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: 0 }}>{editingFormation ? 'Modifier' : 'Nouvelle'} formation</h3>
              </div>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.inkSoft, fontSize: 20, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nom *</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Employé *</label>
                <select name="employee" value={formData.employee} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
                  <option value="">Sélectionner</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Organisme</label>
                <input type="text" name="organisme" value={formData.organisme} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Coût (FCFA)</label>
                <input type="number" name="cout" value={formData.cout} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Déplacement (FCFA)</label>
                <input type="number" name="deplacement" value={formData.deplacement} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Hébergement (FCFA)</label>
                <input type="number" name="hebergement" value={formData.hebergement} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Autres (FCFA)</label>
                <input type="number" name="autres" value={formData.autres} onChange={handleChange} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
              <button onClick={handleCloseModal} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleSubmit} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{editingFormation ? 'Modifier' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormationsSection;
