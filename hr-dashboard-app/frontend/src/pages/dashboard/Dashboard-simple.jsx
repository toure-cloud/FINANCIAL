
import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

/* ---------- Tokens ---------- */
const C = {
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  ink: "#16233D",
  inkSoft: "#5B6577",
  teal: "#2F6F5E",
  tealSoft: "#E7F0ED",
  gold: "#C08A3E",
  goldSoft: "#FBF1E1",
  border: "#E4E7ED",
  danger: "#B4483C",
  dangerSoft: "#FBEAE7",
};

const PIE_COLORS = ["#2F6F5E", "#C08A3E", "#5B7FA6", "#9B6B9E", "#B4483C", "#6B7A8F"];

const MONTHS = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n || 0)) + " FCFA";

const fmtShort = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

/* ---------- Icônes simples (emojis) ---------- */
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: "📊",
    users: "👥",
    wallet: "💰",
    graduation: "🎓",
    receipt: "🧾",
    chart: "📈",
    settings: "⚙️",
    plus: "➕",
    trash: "🗑️",
    close: "❌",
    crown: "👑",
    search: "🔍",
    printer: "🖨️",
  };
  return <span style={{ fontSize: size }}>{icons[name] || "📌"}</span>;
};

/* ---------- Composants réutilisables ---------- */
const Card = ({ children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, ...style }}>{children}</div>
);

const KPI = ({ label, value, accent, sub }) => (
  <Card style={{ flex: 1, minWidth: 150 }}>
    <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
    <div className="mono" style={{ fontSize: 21, fontWeight: 600, marginTop: 8, color: accent || C.ink }}>{value}</div>
    {sub && <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 4 }}>{sub}</div>}
  </Card>
);

const PageTitle = ({ title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <div className="disp" style={{ fontSize: 24, fontWeight: 600 }}>{title}</div>
    {sub && <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 3 }}>{sub}</div>}
  </div>
);

const SelectFilter = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={e => onChange(e.target.value)}>
    <option value="all">{placeholder}</option>
    {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
);

const Empty = ({ text }) => (
  <div style={{ fontSize: 12.5, color: C.inkSoft, padding: "10px 0" }}>{text}</div>
);

const ModalShell = ({ children, onClose, title, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(22,35,61,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 24, width: wide ? 640 : 520, maxHeight: "88vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="disp" style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.inkSoft, fontSize: 18 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const ReportLine = ({ label, value, strong, compact, accent }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: compact ? "3px 0" : "8px 0", borderBottom: compact ? "none" : `1px solid ${C.border}` }}>
    <span style={{ fontSize: compact ? 11.5 : 13, color: C.inkSoft }}>{label}</span>
    <span className="mono" style={{ fontSize: compact ? 11.5 : 13, fontWeight: strong ? 700 : 500, color: accent ? C.teal : C.ink }}>{fmt(value)}</span>
  </div>
);

/* ---------- Dashboard Component ---------- */
function DashboardView({ 
  year, setYear, years, monthFilter, setMonthFilter, 
  empFilter, setEmpFilter, employees, deptFilter, setDeptFilter,
  departments, contractFilter, setContractFilter, contracts,
  kpis, perEmployeeRows, topEmployee, monthlyEvolution, repartition 
}) {
  return (
    <div>
      <PageTitle title="Vue d'ensemble" sub="Coût réel de l'entreprise, employé par employé" />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={year} onChange={e => setYear(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
          <option value="all">Tous les mois</option>
          {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <SelectFilter value={empFilter} onChange={setEmpFilter} placeholder="Tous les employés"
          options={employees.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))} />
        <SelectFilter value={deptFilter} onChange={setDeptFilter} placeholder="Tous les départements" options={departments} />
        <SelectFilter value={contractFilter} onChange={setContractFilter} placeholder="Tous les contrats" options={contracts} />
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <KPI label="Employés" value={kpis.nb} />
        <KPI label="Masse salariale / mois" value={fmt(kpis.masseSalMensuelle)} />
        <KPI label="Masse salariale / an" value={fmt(kpis.masseSalAnnuelle)} />
        <KPI label="Charges patronales" value={fmt(kpis.chargesTotal)} />
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
        <KPI label="Formations (période)" value={fmt(kpis.formationTotal)} accent={C.gold} />
        <KPI label="Autres dépenses (période)" value={fmt(kpis.autresTotal)} accent={C.gold} />
        <KPI label="Coût RH total (période)" value={fmt(kpis.coutRHTotal)} accent={C.teal} />
        <KPI label="Coût moyen / employé" value={fmt(kpis.coutMoyen)} />
        <KPI label={`Coût annuel total ${year}`} value={fmt(kpis.coutAnnuelTotal)} accent={C.teal} />
      </div>

      {topEmployee && (
        <Card style={{ marginBottom: 22, background: C.goldSoft, border: `1px solid #EAD7B0`, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>👑</span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: ".04em" }}>Employé le plus coûteux (période sélectionnée)</div>
            <div className="disp" style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>
              {topEmployee.e.prenom} {topEmployee.e.nom} — <span className="mono">{fmt(topEmployee.totalMensuel)}</span> ce mois-ci
            </div>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 22, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 4px", fontSize: 13, fontWeight: 700 }}>Coût par employé — période sélectionnée</div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr>
              <th>Employé</th><th>Salaire &amp; charges</th><th>Formation</th><th>Autres dépenses</th>
              <th>Coût mensuel</th><th>Coût annuel ({year})</th>
            </tr></thead>
            <tbody>
              {perEmployeeRows.map(r => (
                <tr key={r.e.id}>
                  <td style={{ fontWeight: 600 }}>{r.e.prenom} {r.e.nom}<div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 400 }}>{r.e.poste}</div></td>
                  <td className="mono">{fmtShort(r.salaireCharges)}</td>
                  <td className="mono">{fmtShort(r.form)}</td>
                  <td className="mono">{fmtShort(r.aut)}</td>
                  <td className="mono" style={{ fontWeight: 700 }}>{fmtShort(r.totalMensuel)}</td>
                  <td className="mono" style={{ color: C.teal, fontWeight: 700 }}>{fmtShort(r.totalAnnuel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Coût total par employé (mensuel)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={perEmployeeRows.map(r => ({ name: r.e.nom, total: r.totalMensuel }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.inkSoft }} />
              <YAxis tick={{ fontSize: 11, fill: C.inkSoft }} tickFormatter={fmtShort} width={60} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="total" fill={C.teal} radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Répartition du coût RH</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={repartition} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {repartition.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Évolution mensuelle du coût RH — {year}</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyEvolution}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.inkSoft }} />
            <YAxis tick={{ fontSize: 11, fill: C.inkSoft }} tickFormatter={fmtShort} width={60} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Line type="monotone" dataKey="total" stroke={C.gold} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
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
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddFormation,
  onDeleteFormation,
  onAddDepense,
  onDeleteDepense,
  onUpdateCategories,
  loading = false,
}) {
  const [section, setSection] = useState("dashboard");
  const [year, setYear] = useState(2026);
  const [monthFilter, setMonthFilter] = useState("all");
  const [empFilter, setEmpFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");

  // Calculs
  const monthlyRecurring = (e) =>
    (e.salaire||0)+(e.charges||0)+(e.primes||0)+(e.transport||0)+(e.telephone||0)+(e.assurance||0)+(e.avantages||0)+(e.autresRecurrent||0);

  const inPeriod = (dateStr, y, m) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (y !== "all" && d.getFullYear() !== Number(y)) return false;
    if (m !== "all" && d.getMonth() !== Number(m)) return false;
    return true;
  };

  const formationsTotalFor = (empId, y = "all", m = "all") =>
    formations.filter(f => f.employeeId === empId && inPeriod(f.date, y, m))
      .reduce((s, f) => s + (f.cout||0)+(f.deplacement||0)+(f.hebergement||0)+(f.autres||0), 0);

  const depensesTotalFor = (empId, y = "all", m = "all") =>
    depenses.filter(d => d.employeeId === empId && inPeriod(d.date, y, m))
      .reduce((s, d) => s + (d.montant||0), 0);

  const employeeAnnualCost = (e, y) =>
    monthlyRecurring(e) * 12 + formationsTotalFor(e.id, y, "all") + depensesTotalFor(e.id, y, "all");

  const departments = useMemo(() => [...new Set(employees.map(e => e.departement).filter(Boolean))], [employees]);
  const contracts = useMemo(() => [...new Set(employees.map(e => e.typeContrat).filter(Boolean))], [employees]);
  const years = useMemo(() => {
    const s = new Set([2026]);
    [...formations, ...depenses].forEach(x => x.date && s.add(new Date(x.date).getFullYear()));
    return [...s].sort();
  }, [formations, depenses]);

  const filteredEmployees = useMemo(() => employees.filter(e =>
    (empFilter === "all" || e.id === empFilter) &&
    (deptFilter === "all" || e.departement === deptFilter) &&
    (contractFilter === "all" || e.typeContrat === contractFilter)
  ), [employees, empFilter, deptFilter, contractFilter]);

  const perEmployeeRows = useMemo(() => filteredEmployees.map(e => {
    const salaireCharges = monthlyRecurring(e);
    const form = formationsTotalFor(e.id, year, monthFilter);
    const dep = depensesTotalFor(e.id, year, monthFilter);
    const totalMensuel = salaireCharges + form + dep;
    const totalAnnuel = employeeAnnualCost(e, year);
    return { e, salaireCharges, form, aut: dep, totalMensuel, totalAnnuel };
  }).sort((a,b) => b.totalMensuel - a.totalMensuel), [filteredEmployees, year, monthFilter, formations, depenses]);

  const kpis = useMemo(() => {
    const masseSalMensuelle = filteredEmployees.reduce((s,e)=>s+(e.salaire||0),0);
    const chargesTotal = filteredEmployees.reduce((s,e)=>s+(e.charges||0),0);
    const formationTotal = filteredEmployees.reduce((s,e)=>s+formationsTotalFor(e.id, year, monthFilter),0);
    const depensesTotal = filteredEmployees.reduce((s,e)=>s+depensesTotalFor(e.id, year, monthFilter),0);
    const coutRHTotal = filteredEmployees.reduce((s,e)=>s+monthlyRecurring(e),0) + formationTotal + depensesTotal;
    const coutAnnuelTotal = filteredEmployees.reduce((s,e)=>s+employeeAnnualCost(e, year),0);
    return {
      nb: filteredEmployees.length,
      masseSalMensuelle,
      masseSalAnnuelle: masseSalMensuelle*12,
      chargesTotal,
      formationTotal,
      autresTotal: depensesTotal,
      coutRHTotal,
      coutMoyen: filteredEmployees.length ? coutRHTotal/filteredEmployees.length : 0,
      coutAnnuelTotal,
    };
  }, [filteredEmployees, year, monthFilter, formations, depenses]);

  const topEmployee = perEmployeeRows[0];

  const monthlyEvolution = useMemo(() => {
    return MONTHS.map((label, idx) => {
      const recurrent = filteredEmployees.reduce((s,e)=>s+monthlyRecurring(e),0);
      const form = filteredEmployees.reduce((s,e)=>s+formationsTotalFor(e.id, year, idx),0);
      const dep = filteredEmployees.reduce((s,e)=>s+depensesTotalFor(e.id, year, idx),0);
      return { mois: label, total: recurrent+form+dep };
    });
  }, [filteredEmployees, year, formations, depenses]);

  const repartition = [
    { name: "Salaires & charges", value: filteredEmployees.reduce((s,e)=>s+monthlyRecurring(e),0) },
    { name: "Formations", value: kpis.formationTotal },
    { name: "Autres dépenses", value: kpis.autresTotal },
  ].filter(x => x.value > 0);

  // Navigation
  const NAV = [
    { id: "dashboard", label: "Tableau de Bord", icon: "dashboard" },
    { id: "employes", label: "Employés", icon: "users" },
    { id: "salaires", label: "Salaires", icon: "wallet" },
    { id: "formations", label: "Formations", icon: "graduation" },
    { id: "depenses", label: "Dépenses", icon: "receipt" },
    { id: "rapports", label: "Rapports", icon: "chart" },
    { id: "parametres", label: "Paramètres", icon: "settings" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .disp { font-family: 'Fraunces', serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        table { border-collapse: collapse; width: 100%; }
        th, td { text-align: left; padding: 10px 12px; font-size: 13px; }
        thead th { color: ${C.inkSoft}; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid ${C.border}; }
        tbody tr { border-bottom: 1px solid ${C.border}; }
        tbody tr:hover { background: ${C.bg}; }
        input, select { font-family: 'Inter', sans-serif; font-size: 13px; padding: 7px 9px; border: 1px solid ${C.border}; border-radius: 7px; background: #fff; color: ${C.ink}; }
        input:focus, select:focus { outline: none; border-color: ${C.teal}; box-shadow: 0 0 0 3px ${C.tealSoft}; }
        button { font-family: 'Inter', sans-serif; cursor: pointer; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: #D3D8E0; border-radius: 4px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: C.ink, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "22px 20px 18px" }}>
            <div className="disp" style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.15 }}>Pilotage RH</div>
            <div style={{ fontSize: 11, color: "#8A96AC", marginTop: 3 }}>Coûts par employé · FCFA</div>
          </div>
          <div style={{ flex: 1, padding: "8px 12px" }}>
            {NAV.map(n => {
              const active = section === n.id;
              return (
                <button key={n.id} onClick={() => setSection(n.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "10px 12px", marginBottom: 3, borderRadius: 8, border: "none",
                    background: active ? "rgba(255,255,255,0.1)" : "transparent",
                    color: active ? "#fff" : "#AEB8CB", fontSize: 13.5, fontWeight: active ? 600 : 500,
                    textAlign: "left", transition: "background .15s",
                  }}>
                  <Icon name={n.icon} size={16} />
                  {n.label}
                </button>
              );
            })}
          </div>
          <div style={{ padding: "16px 20px", fontSize: 11, color: "#6B7690", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {employees.length} employés suivis
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "26px 32px", maxWidth: "calc(100vw - 220px)" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
              <div>Chargement des données...</div>
            </div>
          ) : (
            <>
              {section === "dashboard" && (
                <DashboardView 
                  year={year} setYear={setYear} years={years}
                  monthFilter={monthFilter} setMonthFilter={setMonthFilter}
                  empFilter={empFilter} setEmpFilter={setEmpFilter}
                  employees={employees}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
EOF

