import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Area, ComposedChart, Line
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Users, Wallet, GraduationCap, Receipt, LayoutDashboard,
  Award, BarChart3, CalendarDays, UserCog, PiggyBank, Calculator,
  RefreshCw, Mail, Phone
} from "lucide-react";

import EmployesSection from "./EmployesSection";
import SalairesSection from "./SalairesSection";
import FormationsSection from "./FormationsSection";
import DepensesSection from "./DepensesSection";

import {
  employeeService,
  formationService,
  depenseService,
  authService,
} from "../../services/api"; // adapte le chemin si besoin

// ============================================================
// THEME
// ============================================================
const C = {
  bg: "#F8FAFC",
  bgGradient: "linear-gradient(135deg, #F8FAFC 0%, #EFF6F1 100%)",
  surface: "#FFFFFF",
  ink: "#0F172A",
  inkSoft: "#475569",
  inkLight: "#94A3B8",
  teal: "#0D9488",
  tealLight: "#14B8A6",
  tealDark: "#0F766E",
  tealBg: "rgba(13, 148, 136, 0.08)",
  tealGradient: "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
  gold: "#D97706",
  goldGradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
  danger: "#EF4444",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  border: "#E2E8F0",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
  shadowHover: "0 8px 25px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
  radius: 12,
  radiusLarge: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

const PIE_COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#D97706", "#EF4444", "#14B8A6"];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const SECTION_KEY = "rh_section";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const fmt = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(num));
};

const fmtShort = (n) => {
  const num = Number(n) || 0;
  if (num >= 1e9) return (num / 1e9).toFixed(1) + " Mrd";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + " M";
  if (num >= 1e3) return (num / 1e3).toFixed(0) + " k";
  return fmt(num);
};

const GLOBAL_CSS = `
  .mono { font-feature-settings: "tnum"; font-variant-numeric: tabular-nums; }
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ============================================================
// HELPERS MÉTIER
// ============================================================
/** Aligné sur Employee.monthly_recurring_cost() */
const monthlyRecurringCost = (e) => {
  if (!e) return 0;
  return (
    Number(e.salaire || 0) +
    Number(e.charges || 0) +
    Number(e.primes || 0) +
    Number(e.transport || 0) +
    Number(e.cout_telephone || 0) +
    Number(e.assurance || 0) +
    Number(e.avantages || 0) +
    Number(e.autres_recurrent || 0)
  );
};

const formationTotalCost = (f) => {
  if (!f) return 0;
  return (
    Number(f.cout || 0) +
    Number(f.deplacement || 0) +
    Number(f.hebergement || 0) +
    Number(f.autres || 0)
  );
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

const employeeLabel = (e) =>
  e ? `${e.prenom || ""} ${e.nom || ""}`.trim() || e.id || "N/A" : "N/A";

const getEmployeeId = (empOrId) => {
  if (!empOrId) return "";
  if (typeof empOrId === "object") return String(empOrId.id || empOrId.pk || "");
  return String(empOrId);
};

// ============================================================
// UI
// ============================================================
const Card = ({ children, style, ...props }) => (
  <motion.div
    {...fadeInUp}
    style={{
      background: C.surface,
      borderRadius: C.radius,
      padding: 24,
      boxShadow: C.shadow,
      border: "1px solid rgba(0,0,0,0.04)",
      ...style,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

const StatCard = ({ label, value, sub, icon: IconComp, color = C.teal, loading = false }) => (
  <Card style={{ padding: "20px 24px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>{label}</div>
        {loading ? (
          <div
            style={{
              width: 80,
              height: 24,
              background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              borderRadius: 4,
              marginTop: 6,
            }}
          />
        ) : (
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: C.ink, marginTop: 6 }}>
            {value || "0"}
          </div>
        )}
        {sub && <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>{sub}</div>}
      </div>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          flexShrink: 0,
          background: `${color}14`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {IconComp && <IconComp size={20} strokeWidth={1.8} />}
      </div>
    </div>
  </Card>
);

const SelectFilter = ({ value, onChange, options, placeholder, label }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && (
      <label style={{ fontSize: 11, fontWeight: 600, color: C.inkSoft }}>{label}</label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        background: C.surface,
        fontSize: 13,
        cursor: "pointer",
        outline: "none",
        color: C.ink,
        minWidth: 140,
        maxWidth: 200,
      }}
    >
      <option value="all">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  </div>
);

const ChartHeader = ({ title, sub, badge }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: C.inkSoft }}>{sub}</div>}
    </div>
    {badge && (
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: C.teal,
          background: `${C.teal}10`,
          padding: "3px 10px",
          borderRadius: 999,
        }}
      >
        {badge}
      </span>
    )}
  </div>
);

const TH = ({ children, align = "left", pad = "12px 16px" }) => (
  <th
    style={{
      padding: pad,
      textAlign: align,
      fontSize: 11,
      fontWeight: 600,
      color: C.inkSoft,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: `1px solid ${C.border}`,
    }}
  >
    {children}
  </th>
);

// ============================================================
// VUE DASHBOARD
// ============================================================
function DashboardView({
  year,
  setYear,
  monthFilter,
  setMonthFilter,
  empFilter,
  setEmpFilter,
  employees,
  deptFilter,
  setDeptFilter,
  departments,
  contractFilter,
  setContractFilter,
  contracts,
  kpis,
  perEmployeeRows,
  topEmployee,
  monthlyEvolution,
  repartition,
  loading,
  onRefresh,
}) {
  const employeeOptions = useMemo(
    () =>
      (employees || []).map((e) => ({
        value: e.id,
        label: employeeLabel(e),
      })),
    [employees]
  );

  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = 2020; y <= 2050; y++) list.push({ value: String(y), label: String(y) });
    return list;
  }, []);

  return (
    <div>
      {/* Filtres */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 24,
          background: C.surface,
          padding: 16,
          borderRadius: C.radius,
          border: `1px solid ${C.border}`,
          boxShadow: C.shadow,
        }}
      >
        <SelectFilter
          label="Année"
          value={String(year)}
          onChange={(val) => setYear(val === "all" ? "all" : Number(val))}
          options={yearOptions}
          placeholder="Toutes les années"
        />
        <SelectFilter
          label="Mois"
          value={monthFilter}
          onChange={setMonthFilter}
          options={MONTHS.map((m, i) => ({ value: String(i), label: m }))}
          placeholder="Tous les mois"
        />
        <SelectFilter
          label="Employé"
          value={empFilter}
          onChange={setEmpFilter}
          options={employeeOptions}
          placeholder="Tous les employés"
        />
        <SelectFilter
          label="Département"
          value={deptFilter}
          onChange={setDeptFilter}
          options={(departments || []).map((d) => ({ value: d, label: d }))}
          placeholder="Tous les départements"
        />
        <SelectFilter
          label="Type de contrat"
          value={contractFilter}
          onChange={setContractFilter}
          options={(contracts || []).map((c) => ({ value: c, label: c }))}
          placeholder="Tous les contrats"
        />
        <button
          onClick={onRefresh}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: C.surface,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            color: C.inkSoft,
            alignSelf: "flex-end",
          }}
        >
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <StatCard
          label="Total Employés"
          value={String(kpis.nb)}
          sub={`${kpis.actifs} actifs`}
          icon={Users}
          color={C.teal}
          loading={loading}
        />
        <StatCard
          label="Masse Salariale"
          value={fmtShort(kpis.masseSalMensuelle)}
          sub={`Mensuelle · ${year === "all" ? "toutes années" : year}`}
          icon={Wallet}
          color={C.blue}
          loading={loading}
        />
        <StatCard
          label="Charges Patronales"
          value={fmtShort(kpis.chargesTotal)}
          sub={`${kpis.tauxCharges}% du salaire`}
          icon={Receipt}
          color={C.purple}
          loading={loading}
        />
        <StatCard
          label="Coût Annuel Total"
          value={fmtShort(kpis.coutAnnuelTotal)}
          sub={`Exercice ${year === "all" ? "—" : year}`}
          icon={CalendarDays}
          color={C.gold}
          loading={loading}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Formations"
          value={fmtShort(kpis.formationTotal)}
          sub={`${kpis.nbFormations} formation(s)`}
          icon={GraduationCap}
          color={C.gold}
          loading={loading}
        />
        <StatCard
          label="Autres Dépenses"
          value={fmtShort(kpis.autresTotal)}
          sub={`${kpis.nbDepenses} dépense(s)`}
          icon={PiggyBank}
          color={C.danger}
          loading={loading}
        />
        <StatCard
          label="Coût RH Total"
          value={fmtShort(kpis.coutRHTotal)}
          sub="Période sélectionnée"
          icon={Calculator}
          color={C.teal}
          loading={loading}
        />
        <StatCard
          label="Coût Moyen / Employé"
          value={fmtShort(kpis.coutMoyen)}
          sub={`Sur ${kpis.nb} employé(s)`}
          icon={UserCog}
          color={C.blue}
          loading={loading}
        />
      </div>

      {/* Top employé */}
      {topEmployee?.e && (
        <Card
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg, rgba(180,83,9,0.04) 0%, #FFFFFF 60%)",
            border: "1px solid rgba(180,83,9,0.15)",
            padding: "18px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: C.goldGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <Award size={22} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.gold,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Plus haute rémunération
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.ink, marginTop: 2 }}>
                {employeeLabel(topEmployee.e)}
                <span style={{ fontSize: 13.5, fontWeight: 400, color: C.inkSoft, marginLeft: 10 }}>
                  {topEmployee.e.poste || ""}
                </span>
              </div>
              {(topEmployee.e.email || topEmployee.e.telephone) && (
                <div
                  style={{
                    fontSize: 12,
                    color: C.inkSoft,
                    marginTop: 4,
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {topEmployee.e.email && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Mail size={12} /> {topEmployee.e.email}
                    </span>
                  )}
                  {topEmployee.e.telephone && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Phone size={12} /> {topEmployee.e.telephone}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 12, color: C.inkSoft }}>Coût mensuel</div>
              <div className="mono" style={{ fontSize: 19, fontWeight: 700, color: C.gold }}>
                {fmtShort(topEmployee.totalMensuel || 0)}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Graphiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Card>
          <ChartHeader title="Coût par employé" sub="Montant mensuel par collaborateur" badge="Top 10" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={perEmployeeRows.slice(0, 10).map((r) => ({
                name: employeeLabel(r.e),
                total: r.totalMensuel || 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: C.inkSoft }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11, fill: C.inkSoft }} tickFormatter={fmtShort} width={65} />
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}
              />
              <Bar dataKey="total" fill={C.teal} radius={[5, 5, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartHeader title="Répartition des coûts" sub="Structure des dépenses RH" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={repartition}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
                strokeWidth={0}
              >
                {repartition.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11.5 }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Évolution */}
      <Card>
        <ChartHeader
          title="Évolution mensuelle"
          sub={`Coût RH sur 12 mois · ${year === "all" ? "toutes années" : year}`}
        />
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={monthlyEvolution}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.teal} stopOpacity={0.18} />
                <stop offset="100%" stopColor={C.teal} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.inkSoft }} />
            <YAxis tick={{ fontSize: 11, fill: C.inkSoft }} tickFormatter={fmtShort} width={65} />
            <Tooltip
              formatter={(v) => fmt(v)}
              contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="total" fill="url(#areaGrad)" stroke="none" />
            <Line
              type="monotone"
              dataKey="total"
              stroke={C.gold}
              strokeWidth={2.5}
              dot={{ r: 3, fill: C.gold, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Tableau détail */}
      <Card style={{ marginTop: 20, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
          <ChartHeader
            title="Détail par employé"
            sub="Coûts mensuels et annuels"
            badge={`${perEmployeeRows.length} employés`}
          />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <TH pad="12px 24px">Employé</TH>
                <TH align="right">Salaire + Charges</TH>
                <TH align="right">Formation</TH>
                <TH align="right">Autres</TH>
                <TH align="right">Total Mensuel</TH>
                <TH align="right" pad="12px 24px">
                  Total Annuel
                </TH>
              </tr>
            </thead>
            <tbody>
              {perEmployeeRows.slice(0, 15).map((r) => {
                if (!r?.e) return null;
                return (
                  <tr
                    key={r.e.id}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 24px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{employeeLabel(r.e)}</div>
                      <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>
                        {r.e.poste || "—"}
                        {r.e.departement ? ` · ${r.e.departement}` : ""}
                      </div>
                    </td>
                    <td className="mono" style={{ padding: "12px 16px", textAlign: "right", fontSize: 13 }}>
                      {fmtShort(r.salaireCharges || 0)}
                    </td>
                    <td className="mono" style={{ padding: "12px 16px", textAlign: "right", fontSize: 13 }}>
                      {fmtShort(r.form || 0)}
                    </td>
                    <td className="mono" style={{ padding: "12px 16px", textAlign: "right", fontSize: 13 }}>
                      {fmtShort(r.aut || 0)}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.teal,
                      }}
                    >
                      {fmtShort(r.totalMensuel || 0)}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "12px 24px",
                        textAlign: "right",
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.gold,
                      }}
                    >
                      {fmtShort(r.totalAnnuel || 0)}
                    </td>
                  </tr>
                );
              })}
              {perEmployeeRows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: C.inkSoft, fontSize: 13 }}>
                    Aucun employé ne correspond aux filtres
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function DashboardRH({ onLogout }) {
  // Section persistante (F5 garde la page)
  const [section, setSection] = useState(() => {
    try {
      return localStorage.getItem(SECTION_KEY) || "dashboard";
    } catch {
      return "dashboard";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SECTION_KEY, section);
    } catch {
      /* ignore */
    }
  }, [section]);

  const [employees, setEmployees] = useState([]);
  const [formations, setFormations] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [year, setYear] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState("all");
  const [empFilter, setEmpFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");

  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeFormations = Array.isArray(formations) ? formations : [];
  const safeDepenses = Array.isArray(depenses) ? depenses : [];

  // ---------- Chargement centralisé ----------
  const loadAllData = useCallback(async () => {
    try {
      const [empRes, formRes, depRes] = await Promise.all([
        employeeService.getAll(),
        formationService.getAll(),
        depenseService.getAll(),
      ]);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setFormations(Array.isArray(formRes.data) ? formRes.data : []);
      setDepenses(Array.isArray(depRes.data) ? depRes.data : []);
    } catch (err) {
      console.error("Erreur chargement données:", err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadAllData();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAllData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadAllData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, [loadAllData]);

  const handleLogout = () => {
    if (authService?.logout) authService.logout();
    if (typeof onLogout === "function") onLogout();
    else window.location.href = "/login";
  };

  // ---------- Agrégations ----------
  const formationsTotalFor = useCallback(
    (empId, y = "all", m = "all") => {
      const id = String(empId);
      return safeFormations
        .filter((f) => getEmployeeId(f.employee) === id && inPeriod(f.date, y, m))
        .reduce((s, f) => s + formationTotalCost(f), 0);
    },
    [safeFormations]
  );

  const depensesTotalFor = useCallback(
    (empId, y = "all", m = "all") => {
      const id = String(empId);
      return safeDepenses
        .filter((d) => getEmployeeId(d.employee) === id && inPeriod(d.date, y, m))
        .reduce((s, d) => s + Number(d.montant || 0), 0);
    },
    [safeDepenses]
  );

  const employeeAnnualCost = useCallback(
    (e, y) => {
      const monthly = monthlyRecurringCost(e) * 12;
      const forms = formationsTotalFor(e.id, y, "all");
      const deps = depensesTotalFor(e.id, y, "all");
      return monthly + forms + deps;
    },
    [formationsTotalFor, depensesTotalFor]
  );

  const departments = useMemo(
    () => [...new Set(safeEmployees.map((e) => e.departement).filter(Boolean))],
    [safeEmployees]
  );
  const contracts = useMemo(
    () => [...new Set(safeEmployees.map((e) => e.type_contrat).filter(Boolean))],
    [safeEmployees]
  );

  const filteredEmployees = useMemo(() => {
    return safeEmployees.filter((e) => {
      const matchEmp = empFilter === "all" || e.id === empFilter;
      const matchDept = deptFilter === "all" || e.departement === deptFilter;
      const matchContract = contractFilter === "all" || e.type_contrat === contractFilter;
      return matchEmp && matchDept && matchContract;
    });
  }, [safeEmployees, empFilter, deptFilter, contractFilter]);

  const actifs = useMemo(
    () => safeEmployees.filter((e) => e.is_active !== false).length,
    [safeEmployees]
  );

  const perEmployeeRows = useMemo(() => {
    return filteredEmployees
      .map((e) => {
        if (!e?.id) return null;
        const salaireCharges = monthlyRecurringCost(e);
        const form = formationsTotalFor(e.id, year, monthFilter);
        const dep = depensesTotalFor(e.id, year, monthFilter);
        const yForAnnual = year === "all" ? new Date().getFullYear() : year;
        return {
          e,
          salaireCharges,
          form,
          aut: dep,
          totalMensuel: salaireCharges + form + dep,
          totalAnnuel: employeeAnnualCost(e, yForAnnual),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b.totalMensuel || 0) - (a.totalMensuel || 0));
  }, [
    filteredEmployees,
    year,
    monthFilter,
    formationsTotalFor,
    depensesTotalFor,
    employeeAnnualCost,
  ]);

  const kpis = useMemo(() => {
    const nb = filteredEmployees.length;
    const masseSalMensuelle = filteredEmployees.reduce((s, e) => s + Number(e.salaire || 0), 0);
    const chargesTotal = filteredEmployees.reduce((s, e) => s + Number(e.charges || 0), 0);
    const tauxCharges =
      masseSalMensuelle > 0 ? Math.round((chargesTotal / masseSalMensuelle) * 100) : 0;

    const formationTotal = filteredEmployees.reduce(
      (s, e) => s + formationsTotalFor(e.id, year, monthFilter),
      0
    );
    const nbFormations = safeFormations.filter(
      (f) =>
        filteredEmployees.some((e) => e.id === getEmployeeId(f.employee)) &&
        inPeriod(f.date, year, monthFilter)
    ).length;

    const autresTotal = filteredEmployees.reduce(
      (s, e) => s + depensesTotalFor(e.id, year, monthFilter),
      0
    );
    const nbDepenses = safeDepenses.filter(
      (d) =>
        filteredEmployees.some((e) => e.id === getEmployeeId(d.employee)) &&
        inPeriod(d.date, year, monthFilter)
    ).length;

    const totalRecurrent = filteredEmployees.reduce((s, e) => s + monthlyRecurringCost(e), 0);
    const coutRHTotal = totalRecurrent + formationTotal + autresTotal;
    const yForAnnual = year === "all" ? new Date().getFullYear() : year;
    const coutAnnuelTotal = filteredEmployees.reduce(
      (s, e) => s + employeeAnnualCost(e, yForAnnual),
      0
    );
    const coutMoyen = nb > 0 ? coutRHTotal / nb : 0;

    return {
      nb,
      actifs,
      masseSalMensuelle,
      chargesTotal,
      tauxCharges,
      formationTotal,
      nbFormations,
      autresTotal,
      nbDepenses,
      coutRHTotal,
      coutMoyen,
      coutAnnuelTotal,
    };
  }, [
    filteredEmployees,
    year,
    monthFilter,
    safeFormations,
    safeDepenses,
    actifs,
    formationsTotalFor,
    depensesTotalFor,
    employeeAnnualCost,
  ]);

  const topEmployee = perEmployeeRows.length > 0 ? perEmployeeRows[0] : null;

  const monthlyEvolution = useMemo(() => {
    const y = year === "all" ? new Date().getFullYear() : year;
    return MONTHS.map((label, idx) => {
      const recurrent = filteredEmployees.reduce((s, e) => s + monthlyRecurringCost(e), 0);
      const form = filteredEmployees.reduce((s, e) => s + formationsTotalFor(e.id, y, idx), 0);
      const dep = filteredEmployees.reduce((s, e) => s + depensesTotalFor(e.id, y, idx), 0);
      return { mois: label, total: recurrent + form + dep };
    });
  }, [filteredEmployees, year, formationsTotalFor, depensesTotalFor]);

  const repartition = useMemo(() => {
    const totalRecurrent = filteredEmployees.reduce((s, e) => s + monthlyRecurringCost(e), 0);
    const totalFormation = filteredEmployees.reduce(
      (s, e) => s + formationsTotalFor(e.id, year, monthFilter),
      0
    );
    const totalDep = filteredEmployees.reduce(
      (s, e) => s + depensesTotalFor(e.id, year, monthFilter),
      0
    );
    return [
      { name: "Salaires & charges", value: totalRecurrent },
      { name: "Formations", value: totalFormation },
      { name: "Autres dépenses", value: totalDep },
    ].filter((x) => x.value > 0);
  }, [filteredEmployees, year, monthFilter, formationsTotalFor, depensesTotalFor]);

  const NAV = [
    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { id: "employes", label: "Employés", icon: Users },
    { id: "salaires", label: "Salaires", icon: Wallet },
    { id: "formations", label: "Formations", icon: GraduationCap },
    { id: "depenses", label: "Dépenses", icon: Receipt },
  ];

  return (
    <div
      style={{
        background: C.bgGradient,
        minHeight: "100vh",
        width: "100%",
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: C.ink,
        display: "flex",
      }}
    >
      <style>{GLOBAL_CSS}</style>

      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
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
            borderRight: `1px solid ${C.border}`,
            zIndex: 10,
          }}
        >
          <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: C.tealGradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(15,118,110,0.25)",
                }}
              >
                <BarChart3 size={17} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Pilotage RH
                </div>
                <div style={{ fontSize: 11, color: C.inkSoft }}>Coûts par employé · FCFA</div>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }}>
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
                    marginBottom: 3,
                    borderRadius: 9,
                    border: "none",
                    background: active ? C.tealGradient : "transparent",
                    color: active ? "#fff" : C.inkSoft,
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: active ? "0 4px 12px rgba(15,118,110,0.25)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "rgba(0,0,0,0.045)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <n.icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                  {n.label}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "16px 14px", borderTop: `1px solid ${C.border}` }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11.5,
                color: C.inkSoft,
                marginBottom: 12,
                padding: "8px 10px",
                background: `${C.teal}08`,
                borderRadius: 8,
              }}
            >
              <Users size={13} color={C.teal} />
              <span>
                <strong style={{ color: C.ink }}>{safeEmployees.length}</strong> employés suivis
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: C.danger,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(220,38,38,0.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </motion.aside>

        {/* Contenu */}
        <main style={{ flex: 1, padding: "28px 32px", overflowX: "hidden", minWidth: 0 }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "60vh",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  border: `3px solid ${C.border}`,
                  borderTopColor: C.teal,
                  borderRadius: "50%",
                  animation: "spin 0.9s linear infinite",
                }}
              />
              <div style={{ color: C.inkSoft, fontSize: 13.5 }}>Chargement des données…</div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {section === "dashboard" && (
                <div key="dashboard">
                  <DashboardView
                    year={year}
                    setYear={setYear}
                    monthFilter={monthFilter}
                    setMonthFilter={setMonthFilter}
                    empFilter={empFilter}
                    setEmpFilter={setEmpFilter}
                    employees={safeEmployees}
                    deptFilter={deptFilter}
                    setDeptFilter={setDeptFilter}
                    departments={departments}
                    contractFilter={contractFilter}
                    setContractFilter={setContractFilter}
                    contracts={contracts}
                    kpis={kpis}
                    perEmployeeRows={perEmployeeRows}
                    topEmployee={topEmployee}
                    monthlyEvolution={monthlyEvolution}
                    repartition={repartition}
                    loading={isRefreshing}
                    onRefresh={handleRefresh}
                  />
                </div>
              )}
              {section === "employes" && (
                <div key="employes">
                  <EmployesSection
                    employees={safeEmployees}
                    year={year}
                    onRefresh={handleRefresh}
                  />
                </div>
              )}
              {section === "salaires" && (
                <div key="salaires">
                  <SalairesSection
                    employees={safeEmployees}
                    year={year}
                    monthFilter={monthFilter}
                    onRefresh={handleRefresh}
                  />
                </div>
              )}
              {section === "formations" && (
                <div key="formations">
                  <FormationsSection
                    employees={safeEmployees}
                    formations={safeFormations}
                    year={year}
                    onRefresh={handleRefresh}
                  />
                </div>
              )}
              {section === "depenses" && (
                <div key="depenses">
                  <DepensesSection
                    employees={safeEmployees}
                    depenses={safeDepenses}
                    year={year}
                    monthFilter={monthFilter}
                    onRefresh={handleRefresh}
                  />
                </div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}