import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, ComposedChart
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Users, Briefcase, GraduationCap, CreditCard, TrendingUp, TrendingDown, DollarSign, Calendar, User, Settings, Bell } from "lucide-react";
import EmployesSection from './EmployesSection';
import SalairesSection from './SalairesSection';
import FormationsSection from './FormationsSection';
import DepensesSection from './DepensesSection';

/* ---------- Design System Pro ---------- */
const C = {
  bg: "#F0F2F5",
  bgGradient: "linear-gradient(135deg, #F0F2F5 0%, #E8EAED 100%)",
  surface: "#FFFFFF",
  ink: "#1A1D2E",
  inkSoft: "#6B7280",
  inkLight: "#9CA3AF",
  teal: "#0F766E",
  tealLight: "#14B8A6",
  tealDark: "#0D5C56",
  tealGradient: "linear-gradient(135deg, #0F766E 0%, #0D5C56 100%)",
  gold: "#B45309",
  goldLight: "#D97706",
  goldGradient: "linear-gradient(135deg, #B45309 0%, #92400E 100%)",
  border: "#E5E7EB",
  danger: "#DC2626",
  dangerLight: "#EF4444",
  purple: "#7C3AED",
  blue: "#2563EB",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover: "0 10px 40px rgba(0,0,0,0.08)",
  radius: 12,
  radiusLarge: 16,
};

const PIE_COLORS = ["#0F766E", "#B45309", "#2563EB", "#7C3AED", "#DC2626", "#6B7280"];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

const fmt = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("fr-FR").format(Math.round(num)) + " FCFA";
};

const fmtShort = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("fr-FR").format(Math.round(num));
};

/* ---------- Animations ---------- */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeOut" }
};

/* ---------- Composants UI ---------- */
const Card = ({ children, style, ...props }) => (
  <motion.div
    {...fadeInUp}
    style={{
      background: C.surface,
      borderRadius: C.radius,
      padding: 24,
      boxShadow: C.shadow,
      transition: 'all 0.3s ease',
      border: '1px solid rgba(0,0,0,0.04)',
      ...style
    }}
    whileHover={{ boxShadow: C.shadowHover }}
    {...props}
  >
    {children}
  </motion.div>
);

const StatCard = ({ label, value, sub, trend, trendValue, color }) => (
  <Card style={{ flex: 1, minWidth: 160, padding: '20px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 500, letterSpacing: '0.02em' }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.ink, marginTop: 6 }}>
          {value || "0"}
        </div>
        {sub && <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{sub}</div>}
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            {trend === 'up' ? (
              <TrendingUp size={14} color={C.teal} />
            ) : (
              <TrendingDown size={14} color={C.danger} />
            )}
            <span style={{ fontSize: 12, color: trend === 'up' ? C.teal : C.danger, fontWeight: 500 }}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: color || C.teal,
        opacity: 0.08,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 18 }}>📊</span>
      </div>
    </div>
  </Card>
);

const PageTitle = ({ title, sub }) => (
  <div style={{ marginBottom: 28 }}>
    <h1 style={{ fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em', margin: 0 }}>
      {title}
    </h1>
    {sub && <p style={{ fontSize: 14, color: C.inkSoft, marginTop: 4 }}>{sub}</p>}
  </div>
);

const SelectFilter = ({ value, onChange, options, placeholder }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      padding: "8px 16px",
      borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: C.surface,
      fontSize: 13,
      cursor: "pointer",
      outline: 'none',
      transition: 'all 0.2s ease',
      color: C.ink,
      boxShadow: C.shadow,
      minWidth: 140,
    }}
    onFocus={e => e.target.style.borderColor = C.teal}
    onBlur={e => e.target.style.borderColor = C.border}
  >
    <option value="all">{placeholder}</option>
    {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
);

/* ---------- DashboardView ---------- */
function DashboardView({ 
  year, setYear, years, monthFilter, setMonthFilter, 
  empFilter, setEmpFilter, employees, deptFilter, setDeptFilter,
  departments, contractFilter, setContractFilter, contracts,
  kpis, perEmployeeRows, topEmployee, monthlyEvolution, repartition 
}) {
  return (
    <div>
      {/* Filtres */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <SelectFilter value={year} onChange={setYear} options={years} placeholder="Année" />
        <SelectFilter 
          value={monthFilter} 
          onChange={setMonthFilter} 
          options={MONTHS.map((m,i) => ({ value: i, label: m }))} 
          placeholder="Tous les mois"
        />
        <SelectFilter 
          value={empFilter} 
          onChange={setEmpFilter} 
          options={employees.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))} 
          placeholder="Tous les employés"
        />
        <SelectFilter value={deptFilter} onChange={setDeptFilter} options={departments} placeholder="Tous les départements" />
        <SelectFilter value={contractFilter} onChange={setContractFilter} options={contracts} placeholder="Tous les contrats" />
      </div>

      {/* KPIs - Ligne 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
        <StatCard label="Total Employés" value={kpis.nb} color={C.teal} />
        <StatCard 
          label="Masse Salariale Mensuelle" 
          value={fmtShort(kpis.masseSalMensuelle)} 
          sub="Brut mensuel"
          color={C.blue}
          trend="up"
          trendValue="+8% vs mois dernier"
        />
        <StatCard 
          label="Charges Patronales" 
          value={fmtShort(kpis.chargesTotal)} 
          color={C.purple}
        />
        <StatCard 
          label="Coût Annuel Total" 
          value={fmtShort(kpis.coutAnnuelTotal)} 
          sub={`Exercice ${year}`}
          color={C.gold}
        />
      </div>

      {/* KPIs - Ligne 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard 
          label="Formations" 
          value={fmtShort(kpis.formationTotal)} 
          sub="Coût total"
          color={C.gold}
        />
        <StatCard 
          label="Autres Dépenses" 
          value={fmtShort(kpis.autresTotal)} 
          color={C.danger}
        />
        <StatCard 
          label="Coût RH Total" 
          value={fmtShort(kpis.coutRHTotal)} 
          sub="Mensuel"
          color={C.teal}
          trend="up"
          trendValue="+5.2%"
        />
        <StatCard 
          label="Coût Moyen / Employé" 
          value={fmtShort(kpis.coutMoyen)} 
          color={C.blue}
        />
      </div>

      {/* Top Employee */}
      {topEmployee && (
        <Card style={{ 
          marginBottom: 24, 
          background: `linear-gradient(135deg, ${C.gold}08 0%, #FFFFFF 100%)`,
          border: `1px solid ${C.gold}20`,
          padding: '20px 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: C.goldGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 20,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              <span>🏆</span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Plus haute rémunération
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>
                {topEmployee.e.prenom} {topEmployee.e.nom}
                <span style={{ fontSize: 14, fontWeight: 400, color: C.inkSoft, marginLeft: 12 }}>
                  {topEmployee.e.poste}
                </span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: C.inkSoft }}>Coût mensuel</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>
                {fmtShort(topEmployee.totalMensuel)}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Graphiques */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Coût par employé</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Montant mensuel par collaborateur</div>
            </div>
            <span style={{ fontSize: 12, color: C.inkSoft }}>Top 10</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perEmployeeRows.slice(0, 10).map(r => ({ 
              name: r.e.nom, 
              total: r.totalMensuel 
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.inkSoft }} />
              <YAxis tick={{ fontSize: 11, fill: C.inkSoft }} tickFormatter={fmtShort} width={60} />
              <Tooltip formatter={(v) => fmt(v)} cursor={{ fill: 'rgba(15, 118, 110, 0.04)' }} />
              <Bar dataKey="total" fill={C.teal} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Répartition des coûts</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Structure des dépenses RH</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={repartition} 
                dataKey="value" 
                nameKey="name" 
                innerRadius={55} 
                outerRadius={90} 
                paddingAngle={2}
              >
                {repartition.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Évolution mensuelle */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Évolution mensuelle</div>
            <div style={{ fontSize: 12, color: C.inkSoft }}>Coût RH sur 12 mois</div>
          </div>
          <span style={{ fontSize: 12, color: C.inkSoft }}>{year}</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={monthlyEvolution}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.inkSoft }} />
            <YAxis tick={{ fontSize: 11, fill: C.inkSoft }} tickFormatter={fmtShort} width={60} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Area type="monotone" dataKey="total" fill={C.teal} fillOpacity={0.08} stroke={C.teal} strokeWidth={2} />
            <Line type="monotone" dataKey="total" stroke={C.gold} strokeWidth={2} dot={{ r: 3, fill: C.gold }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Tableau des employés */}
      <Card style={{ marginTop: 20, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Détail par employé</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Coûts mensuels et annuels</div>
            </div>
            <span style={{ fontSize: 12, color: C.inkSoft }}>{perEmployeeRows.length} employés</span>
          </div>
        </div>
        <div style={{ overflowX: "auto", padding: '4px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Employé
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Salaire + Charges
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Formation
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Autres
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Mensuel
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Annuel
                </th>
              </tr>
            </thead>
            <tbody>
              {perEmployeeRows.slice(0, 10).map((r) => (
                <tr key={r.e.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 24px', fontSize: 13, fontWeight: 500 }}>
                    {r.e.prenom} {r.e.nom}
                    <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 400 }}>{r.e.poste}</div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>
                    {fmtShort(r.salaireCharges)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>
                    {fmtShort(r.form)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>
                    {fmtShort(r.aut)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: C.teal, fontFamily: 'monospace' }}>
                    {fmtShort(r.totalMensuel)}
                  </td>
                  <td style={{ padding: '12px 24px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: C.gold, fontFamily: 'monospace' }}>
                    {fmtShort(r.totalAnnuel)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------- COMPOSANT PRINCIPAL ---------- */
export default function DashboardRH({ 
  employees = [],
  formations = [],
  depenses = [],
  categories = [],
  loading = false,
  onLogout,
}) {
  const [section, setSection] = useState("dashboard");
  const [year, setYear] = useState(2026);
  const [monthFilter, setMonthFilter] = useState("all");
  const [empFilter, setEmpFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeFormations = Array.isArray(formations) ? formations : [];
  const safeDepenses = Array.isArray(depenses) ? depenses : [];

  const monthlyRecurring = (e) => {
    if (!e) return 0;
    return Number(e.salaire || 0) + Number(e.charges || 0) + Number(e.primes || 0) + 
           Number(e.transport || 0) + Number(e.telephone || 0) + Number(e.assurance || 0) + 
           Number(e.avantages || 0) + Number(e.autres_recurrent || 0);
  };

  const inPeriod = (dateStr, y, m) => {
    if (!dateStr) return false;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      if (y !== "all" && d.getFullYear() !== Number(y)) return false;
      if (m !== "all" && d.getMonth() !== Number(m)) return false;
      return true;
    } catch {
      return false;
    }
  };

  const formationsTotalFor = (empId, y = "all", m = "all") => {
    return safeFormations
      .filter(f => f.employee === empId && inPeriod(f.date, y, m))
      .reduce((s, f) => {
        return s + Number(f.cout || 0) + Number(f.deplacement || 0) + 
               Number(f.hebergement || 0) + Number(f.autres || 0);
      }, 0);
  };

  const depensesTotalFor = (empId, y = "all", m = "all") => {
    return safeDepenses
      .filter(d => d.employee === empId && inPeriod(d.date, y, m))
      .reduce((s, d) => s + Number(d.montant || 0), 0);
  };

  const employeeAnnualCost = (e, y) => {
    return monthlyRecurring(e) * 12 + formationsTotalFor(e.id, y, "all") + depensesTotalFor(e.id, y, "all");
  };

  const departments = useMemo(() => [...new Set(safeEmployees.map(e => e.departement).filter(Boolean))], [safeEmployees]);
  const contracts = useMemo(() => [...new Set(safeEmployees.map(e => e.type_contrat).filter(Boolean))], [safeEmployees]);
  const years = [2025, 2026, 2027];

  const filteredEmployees = useMemo(() => safeEmployees.filter(e =>
    (empFilter === "all" || e.id === empFilter) &&
    (deptFilter === "all" || e.departement === deptFilter) &&
    (contractFilter === "all" || e.type_contrat === contractFilter)
  ), [safeEmployees, empFilter, deptFilter, contractFilter]);

  const perEmployeeRows = useMemo(() => {
    return filteredEmployees.map(e => {
      const salaireCharges = monthlyRecurring(e);
      const form = formationsTotalFor(e.id, year, monthFilter);
      const dep = depensesTotalFor(e.id, year, monthFilter);
      const totalMensuel = salaireCharges + form + dep;
      const totalAnnuel = employeeAnnualCost(e, year);
      return { e, salaireCharges, form, aut: dep, totalMensuel, totalAnnuel };
    }).sort((a, b) => b.totalMensuel - a.totalMensuel);
  }, [filteredEmployees, year, monthFilter]);

  const kpis = useMemo(() => {
    const nb = filteredEmployees.length;
    const masseSalMensuelle = filteredEmployees.reduce((s, e) => s + Number(e.salaire || 0), 0);
    const chargesTotal = filteredEmployees.reduce((s, e) => s + Number(e.charges || 0), 0);
    const formationTotal = filteredEmployees.reduce((s, e) => s + formationsTotalFor(e.id, year, monthFilter), 0);
    const autresTotal = filteredEmployees.reduce((s, e) => s + depensesTotalFor(e.id, year, monthFilter), 0);
    const totalRecurrent = filteredEmployees.reduce((s, e) => s + monthlyRecurring(e), 0);
    const coutRHTotal = totalRecurrent + formationTotal + autresTotal;
    
    return {
      nb,
      masseSalMensuelle,
      masseSalAnnuelle: masseSalMensuelle * 12,
      chargesTotal,
      formationTotal,
      autresTotal,
      coutRHTotal,
      coutMoyen: nb > 0 ? coutRHTotal / nb : 0,
      coutAnnuelTotal: filteredEmployees.reduce((s, e) => s + employeeAnnualCost(e, year), 0),
    };
  }, [filteredEmployees, year, monthFilter]);

  const topEmployee = perEmployeeRows[0] || null;

  const monthlyEvolution = useMemo(() => {
    return MONTHS.map((label, idx) => {
      const recurrent = filteredEmployees.reduce((s, e) => s + monthlyRecurring(e), 0);
      const form = filteredEmployees.reduce((s, e) => s + formationsTotalFor(e.id, year, idx), 0);
      const dep = filteredEmployees.reduce((s, e) => s + depensesTotalFor(e.id, year, idx), 0);
      return { mois: label, total: recurrent + form + dep };
    });
  }, [filteredEmployees, year]);

  const repartition = useMemo(() => {
    return [
      { name: "Salaires & charges", value: filteredEmployees.reduce((s, e) => s + monthlyRecurring(e), 0) },
      { name: "Formations", value: kpis.formationTotal },
      { name: "Autres dépenses", value: kpis.autresTotal },
    ].filter(x => x.value > 0);
  }, [filteredEmployees, kpis]);

  const NAV = [
    { id: "dashboard", label: "Tableau de Bord", icon: "📊" },
    { id: "employes", label: "Employés", icon: "👥" },
    { id: "salaires", label: "Salaires", icon: "💰" },
    { id: "formations", label: "Formations", icon: "🎓" },
    { id: "depenses", label: "Dépenses", icon: "🧾" },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div style={{ 
      background: C.bgGradient,
      minHeight: "100vh", 
      height: "100%",
      width: "100%",
      fontFamily: "'Inter', -apple-system, sans-serif", 
      color: C.ink,
      display: "flex",
      margin: 0,
      padding: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .mono { font-feature-settings: "tnum"; font-variant-numeric: tabular-nums; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
      `}</style>

      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ 
            width: 240, 
            minHeight: "100vh",
            background: C.surface,
            color: C.ink, 
            display: "flex", 
            flexDirection: "column", 
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100vh",
            boxShadow: '1px 0 0 rgba(0,0,0,0.04)',
            zIndex: 10,
            borderRight: `1px solid ${C.border}`,
          }}
        >
          {/* Header */}
          <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Pilotage RH
            </div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
              Coûts par employé · FCFA
            </div>
          </div>
          
          {/* Navigation */}
          <div style={{ flex: 1, padding: "12px 14px", overflowY: "auto" }}>
            {NAV.map((n) => {
              const active = section === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSection(n.id)}
                  style={{
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    width: "100%",
                    padding: "10px 14px", 
                    marginBottom: 2, 
                    borderRadius: 8, 
                    border: "none",
                    background: active ? C.teal : "transparent",
                    color: active ? "#fff" : C.inkSoft,
                    fontSize: 13.5, 
                    fontWeight: active ? 600 : 500,
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: 16 }}>{n.icon}</span>
                  {n.label}
                </button>
              );
            })}
          </div>
          
          {/* Footer */}
          <div style={{ 
            padding: "16px 18px", 
            borderTop: `1px solid ${C.border}`,
          }}>
            <div style={{ 
              fontSize: 12, 
              color: C.inkSoft, 
              marginBottom: 12,
            }}>
              {safeEmployees.length} employés suivis
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: C.danger,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ 
            flex: 1, 
            padding: "28px 32px", 
            overflowY: "auto",
            minHeight: "100vh",
          }}
        >
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", flexDirection: "column", gap: 20 }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                border: `3px solid ${C.border}`,
                borderTop: `3px solid ${C.teal}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ color: C.inkSoft, fontSize: 14 }}>Chargement des données...</div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {section === "dashboard" && (
                <DashboardView 
                  key="dashboard"
                  year={year} setYear={setYear} years={years}
                  monthFilter={monthFilter} setMonthFilter={setMonthFilter}
                  empFilter={empFilter} setEmpFilter={setEmpFilter}
                  employees={safeEmployees}
                  deptFilter={deptFilter} setDeptFilter={setDeptFilter}
                  departments={departments}
                  contractFilter={contractFilter} setContractFilter={setContractFilter}
                  contracts={contracts}
                  kpis={kpis}
                  perEmployeeRows={perEmployeeRows}
                  topEmployee={topEmployee}
                  monthlyEvolution={monthlyEvolution}
                  repartition={repartition}
                />
              )}
              {section === "employes" && (
                <motion.div key="employes" {...fadeInUp}>
                  <EmployesSection />
                </motion.div>
              )}
              {section === "salaires" && (
                <motion.div key="salaires" {...fadeInUp}>
                  <SalairesSection />
                </motion.div>
              )}
              {section === "formations" && (
                <motion.div key="formations" {...fadeInUp}>
                  <FormationsSection />
                </motion.div>
              )}
              {section === "depenses" && (
                <motion.div key="depenses" {...fadeInUp}>
                  <DepensesSection />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}
