import React, { useState, useMemo } from "react";
import {
  Search, Download, RefreshCw, Users, Wallet, Building2
} from "lucide-react";

// ============================================================
// THEME (aligné avec DashboardRH)
// ============================================================
const C = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  ink: "#0F172A",
  inkSoft: "#475569",
  inkLight: "#94A3B8",
  teal: "#0D9488",
  tealLight: "#14B8A6",
  tealDark: "#0F766E",
  tealGradient: "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
  gold: "#D97706",
  purple: "#8B5CF6",
  blue: "#3B82F6",
  border: "#E2E8F0",
  danger: "#EF4444",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
  radius: 12,
};

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const fmt = (n) => {
  const num = Number(n) || 0;
  return (
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(num))
  );
};

const fmtShort = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("fr-FR").format(Math.round(num));
};

const Card = ({ children, style }) => (
  <div
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: C.radius,
      padding: 18,
      boxShadow: C.shadow,
      ...style,
    }}
  >
    {children}
  </div>
);

const PageTitle = ({ title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: C.ink, margin: 0 }}>
      {title}
    </h2>
    {sub && (
      <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>{sub}</p>
    )}
  </div>
);

/**
 * Correspond à Employee.monthly_recurring_cost()
 * IMPORTANT : cout_telephone (coût), PAS telephone (numéro)
 */
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

const COST_COLS = [
  { key: "salaire", label: "Salaire de base" },
  { key: "charges", label: "Charges patronales" },
  { key: "primes", label: "Primes / Bonus" },
  { key: "transport", label: "Transport" },
  { key: "cout_telephone", label: "Coût téléphone" },
  { key: "assurance", label: "Assurance" },
  { key: "avantages", label: "Avantages" },
  { key: "autres_recurrent", label: "Autres" },
];

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
/**
 * Props attendues depuis DashboardRH :
 * - employees
 * - year (number | "all")
 * - monthFilter ("all" | "0".."11")
 * - onRefresh (optionnel)
 * - formationsTotalFor / depensesTotalFor (optionnels, non utilisés ici pour les coûts récurrents)
 */
export default function SalairesSection({
  employees = [],
  year: yearProp,
  monthFilter: monthProp,
  onRefresh,
}) {
  const safeEmployees = Array.isArray(employees) ? employees : [];

  // Filtres locaux (synchronisables avec le parent)
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    monthProp !== undefined && monthProp !== "all"
      ? Number(monthProp)
      : new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    yearProp && yearProp !== "all"
      ? Number(yearProp)
      : new Date().getFullYear()
  );

  // Années 2020 → 2050 (comme DashboardRH)
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = 2020; y <= 2050; y++) list.push(y);
    return list;
  }, []);

  const departments = useMemo(
    () => [
      ...new Set(safeEmployees.map((e) => e.departement).filter(Boolean)),
    ],
    [safeEmployees]
  );

  const contracts = useMemo(
    () => [
      ...new Set(safeEmployees.map((e) => e.type_contrat).filter(Boolean)),
    ],
    [safeEmployees]
  );

  // Filtrage
  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return safeEmployees.filter((e) => {
      const matchSearch =
        !q ||
        `${e.prenom || ""} ${e.nom || ""} ${e.poste || ""} ${e.email || ""}`
          .toLowerCase()
          .includes(q);
      const matchDept =
        deptFilter === "all" || e.departement === deptFilter;
      const matchContract =
        contractFilter === "all" || e.type_contrat === contractFilter;
      // Les coûts récurrents sont mensuels → mois/année servent surtout d’info d’export / contexte
      return matchSearch && matchDept && matchContract;
    });
  }, [safeEmployees, searchTerm, deptFilter, contractFilter]);

  // Totaux
  const totals = useMemo(() => {
    const acc = {
      salaire: 0,
      charges: 0,
      primes: 0,
      transport: 0,
      cout_telephone: 0,
      assurance: 0,
      avantages: 0,
      autres_recurrent: 0,
      total: 0,
    };
    filteredEmployees.forEach((e) => {
      COST_COLS.forEach(({ key }) => {
        acc[key] += Number(e[key] || 0);
      });
      acc.total += monthlyRecurringCost(e);
    });
    return acc;
  }, [filteredEmployees]);

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Employé",
      "Poste",
      "Département",
      "Type contrat",
      "Email",
      "Téléphone",
      ...COST_COLS.map((c) => c.label),
      "Total mensuel",
    ];

    const rows = filteredEmployees.map((e) => [
      `${e.prenom || ""} ${e.nom || ""}`.trim(),
      e.poste || "",
      e.departement || "",
      e.type_contrat || "",
      e.email || "",
      e.telephone || "",
      ...COST_COLS.map(({ key }) => Number(e[key] || 0)),
      monthlyRecurringCost(e),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell ?? "");
            return s.includes(",") || s.includes('"')
              ? `"${s.replace(/"/g, '""')}"`
              : s;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `salaires_${selectedYear}_${String(selectedMonth + 1).padStart(2, "0")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const selectStyle = {
    padding: "8px 14px",
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    fontSize: 13,
    background: "#fff",
    cursor: "pointer",
    outline: "none",
    color: C.ink,
  };

  return (
    <div>
      {/* En-tête */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <PageTitle
          title="Salaires"
          sub={`Coûts mensuels récurrents · ${MONTHS[selectedMonth]} ${selectedYear}`}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={selectStyle}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={selectStyle}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            style={{
              background: C.tealGradient,
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(15,118,110,0.2)",
            }}
          >
            <Download size={15} /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Barre de filtres */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.inkSoft,
            }}
          />
          <input
            type="text"
            placeholder="Rechercher (nom, poste, email)…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px 8px 35px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              background: "#fff",
              boxSizing: "border-box",
            }}
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{ ...selectStyle, minWidth: 160 }}
        >
          <option value="all">Tous départements</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={contractFilter}
          onChange={(e) => setContractFilter(e.target.value)}
          style={{ ...selectStyle, minWidth: 140 }}
        >
          <option value="all">Tous contrats</option>
          {contracts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {typeof onRefresh === "function" && (
          <button
            onClick={onRefresh}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <RefreshCw size={14} /> Actualiser
          </button>
        )}

        <span
          style={{
            fontSize: 13,
            color: C.inkSoft,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Users size={14} /> {filteredEmployees.length} employé(s)
        </span>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Card style={{ background: `${C.teal}08`, borderColor: `${C.teal}40` }}>
          <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 500 }}>
            Masse salariale
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.teal,
              marginTop: 4,
            }}
          >
            {fmt(totals.salaire)}
          </div>
        </Card>
        <Card style={{ background: `${C.gold}08`, borderColor: `${C.gold}40` }}>
          <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 500 }}>
            Total charges
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.gold,
              marginTop: 4,
            }}
          >
            {fmt(totals.charges)}
          </div>
        </Card>
        <Card
          style={{ background: `${C.purple}08`, borderColor: `${C.purple}40` }}
        >
          <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 500 }}>
            Total primes
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.purple,
              marginTop: 4,
            }}
          >
            {fmt(totals.primes)}
          </div>
        </Card>
        <Card style={{ background: `${C.blue}08`, borderColor: `${C.blue}40` }}>
          <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 500 }}>
            Coût téléphone
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.blue,
              marginTop: 4,
            }}
          >
            {fmt(totals.cout_telephone)}
          </div>
        </Card>
        <Card style={{ background: `${C.teal}08`, borderColor: `${C.teal}40` }}>
          <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 500 }}>
            Coût total mensuel
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.teal,
              marginTop: 4,
            }}
          >
            {fmt(totals.total)}
          </div>
        </Card>
      </div>

      {/* Tableau */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.inkSoft,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Employé
                </th>
                {COST_COLS.map(({ key, label }) => (
                  <th
                    key={key}
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.inkSoft,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </th>
                ))}
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.teal,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((e) => {
                const total = monthlyRecurringCost(e);
                return (
                  <tr
                    key={e.id}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(ev) =>
                      (ev.currentTarget.style.background = "#FAFBFC")
                    }
                    onMouseLeave={(ev) =>
                      (ev.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>
                        {e.prenom} {e.nom}
                      </div>
                      <div style={{ fontSize: 11.5, color: C.inkSoft }}>
                        {e.poste || "—"}
                        {e.departement ? (
                          <span style={{ marginLeft: 6 }}>
                            <Building2
                              size={10}
                              style={{
                                display: "inline",
                                verticalAlign: "middle",
                                marginRight: 2,
                              }}
                            />
                            {e.departement}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    {COST_COLS.map(({ key }) => (
                      <td
                        key={key}
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontSize: 13,
                          fontFamily: "monospace",
                        }}
                      >
                        {fmtShort(e[key] || 0)}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.teal,
                        fontFamily: "monospace",
                      }}
                    >
                      {fmtShort(total)}
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={COST_COLS.length + 2}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: C.inkSoft,
                    }}
                  >
                    Aucun employé ne correspond aux filtres
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr
                style={{
                  background: C.bg,
                  fontWeight: 700,
                  borderTop: `2px solid ${C.border}`,
                }}
              >
                <td style={{ padding: "12px 16px", fontSize: 13 }}>
                  Total ({filteredEmployees.length})
                </td>
                {COST_COLS.map(({ key }) => (
                  <td
                    key={key}
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontSize: 13,
                      fontFamily: "monospace",
                    }}
                  >
                    {fmtShort(totals[key] || 0)}
                  </td>
                ))}
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontSize: 15,
                    fontWeight: 700,
                    color: C.teal,
                    fontFamily: "monospace",
                  }}
                >
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