import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Search, Edit, RefreshCw } from 'lucide-react';
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

function EmployesSection() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedContrat, setSelectedContrat] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    id: '', nom: '', prenom: '', poste: '', departement: '',
    date_embauche: '', type_contrat: 'CDI',
    salaire: 0, charges: 0, primes: 0, transport: 0,
    telephone: 0, assurance: 0, avantages: 0, autres_recurrent: 0
  });

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
      setError('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = (e) => {
    if (!e) return 0;
    return Number(e.salaire || 0) + Number(e.charges || 0) + Number(e.primes || 0) + 
           Number(e.transport || 0) + Number(e.telephone || 0) + Number(e.assurance || 0) + 
           Number(e.avantages || 0) + Number(e.autres_recurrent || 0);
  };

  const departments = [...new Set(employees.map(e => e.departement).filter(Boolean))];
  const contracts = [...new Set(employees.map(e => e.type_contrat).filter(Boolean))];

  const filteredEmployees = employees.filter(e => {
    const matchSearch = `${e.prenom || ''} ${e.nom || ''} ${e.poste || ''} ${e.departement || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === "all" || e.departement === selectedDept;
    const matchContrat = selectedContrat === "all" || e.type_contrat === selectedContrat;
    return matchSearch && matchDept && matchContrat;
  });

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        id: employee.id || `emp_${Date.now()}`,
        nom: employee.nom || '',
        prenom: employee.prenom || '',
        poste: employee.poste || '',
        departement: employee.departement || '',
        date_embauche: employee.date_embauche || '',
        type_contrat: employee.type_contrat || 'CDI',
        salaire: Number(employee.salaire) || 0,
        charges: Number(employee.charges) || 0,
        primes: Number(employee.primes) || 0,
        transport: Number(employee.transport) || 0,
        telephone: Number(employee.telephone) || 0,
        assurance: Number(employee.assurance) || 0,
        avantages: Number(employee.avantages) || 0,
        autres_recurrent: Number(employee.autres_recurrent) || 0
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        id: `emp_${Date.now()}`,
        nom: '', prenom: '', poste: '', departement: '',
        date_embauche: new Date().toISOString().split('T')[0],
        type_contrat: 'CDI',
        salaire: 0, charges: 0, primes: 0, transport: 0,
        telephone: 0, assurance: 0, avantages: 0, autres_recurrent: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, formData);
      } else {
        await employeeService.create(formData);
      }
      handleCloseModal();
      fetchEmployees();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id) => {
    // Vérifier que l'ID est valide
    if (!id) {
      console.error('ID invalide pour la suppression');
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await employeeService.delete(id);
        fetchEmployees();
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
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>Chargement des employés...</div>;
  }

  if (error) {
    return (
      <div style={{ color: C.danger, padding: '20px', textAlign: 'center' }}>
        {error}
        <button onClick={fetchEmployees} style={{ marginLeft: 10, padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff' }}>
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <PageTitle title="Employés" sub={`${employees.length} employés actifs`} />
        <button onClick={() => handleOpenModal()} style={{ background: C.teal, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> Ajouter
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.inkSoft }} />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 35px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
          />
        </div>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
        >
          <option value="all">Tous les départements</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={selectedContrat}
          onChange={(e) => setSelectedContrat(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
        >
          <option value="all">Tous les contrats</option>
          {contracts.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={fetchEmployees} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Actualiser
        </button>
        <span style={{ fontSize: 13, color: C.inkSoft }}>{filteredEmployees.length} employés</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filteredEmployees.map(e => {
          const cost = totalCost(e);
          return (
            <Card key={e.id} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div onClick={() => setSelectedEmployee(e)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{e.prenom} {e.nom}</div>
                    <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>{e.poste} · {e.departement}</div>
                  </div>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 20,
                    background: e.type_contrat === 'CDI' ? `${C.teal}15` : `${C.gold}15`,
                    color: e.type_contrat === 'CDI' ? C.teal : C.gold
                  }}>
                    {e.type_contrat}
                  </span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: C.inkSoft }}>Coût mensuel total</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{fmt(cost)}</div>
                </div>
                <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>
                  Salaire: <span style={{ color: C.teal, fontWeight: 600 }}>{fmt(e.salaire)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => handleOpenModal(e)} style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 0', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Edit size={13} /> Modifier
                </button>
                <button onClick={() => handleDelete(e.id)} style={{ background: `${C.danger}15`, color: C.danger, border: 'none', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }} onClick={() => setSelectedEmployee(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, width: 600, maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: 0 }}>{selectedEmployee.prenom} {selectedEmployee.nom}</h3>
              <button onClick={() => setSelectedEmployee(null)} style={{ background: 'none', border: 'none', color: C.inkSoft, fontSize: 20, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 14 }}>{selectedEmployee.poste} · {selectedEmployee.departement} · {selectedEmployee.type_contrat} · embauché le {selectedEmployee.date_embauche}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><strong>Salaire:</strong> {fmt(selectedEmployee.salaire)}</div>
              <div><strong>Charges:</strong> {fmt(selectedEmployee.charges)}</div>
              <div><strong>Primes:</strong> {fmt(selectedEmployee.primes)}</div>
              <div><strong>Transport:</strong> {fmt(selectedEmployee.transport)}</div>
              <div><strong>Téléphone:</strong> {fmt(selectedEmployee.telephone)}</div>
              <div><strong>Assurance:</strong> {fmt(selectedEmployee.assurance)}</div>
              <div><strong>Avantages:</strong> {fmt(selectedEmployee.avantages)}</div>
              <div><strong>Total:</strong> <span style={{ color: C.teal, fontWeight: 700 }}>{fmt(totalCost(selectedEmployee))}</span></div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 520, maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: 0 }}>{editingEmployee ? 'Modifier' : 'Nouvel'} employé</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.inkSoft, fontSize: 20, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Prénom</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nom</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Poste</label>
                <input type="text" name="poste" value={formData.poste} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Département</label>
                <input type="text" name="departement" value={formData.departement} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Date d'embauche</label>
                <input type="date" name="date_embauche" value={formData.date_embauche} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Type de contrat</label>
                <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="STAGE">Stage</option>
                  <option value="CONSULTANT">Consultant</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Salaire (FCFA)</label>
                <input type="number" name="salaire" value={formData.salaire} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Charges (FCFA)</label>
                <input type="number" name="charges" value={formData.charges} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Primes (FCFA)</label>
                <input type="number" name="primes" value={formData.primes} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, display: 'block', marginBottom: 4 }}>Transport (FCFA)</label>
                <input type="number" name="transport" value={formData.transport} onChange={handleChange} style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18, borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
              <button onClick={handleCloseModal} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleSubmit} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{editingEmployee ? 'Modifier' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployesSection;
