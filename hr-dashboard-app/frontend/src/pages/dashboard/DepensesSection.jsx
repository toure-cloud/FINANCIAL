import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Search, Receipt, X,
  AlertTriangle, CheckCircle2, RefreshCw
} from "lucide-react";
import { depenseService } from "../../services/api";

// ============================================================
// THEME
// ============================================================
const C = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  ink: "#0F172A",
  inkSoft: "#475569",
  inkLight: "#94A3B8",
  teal: "#0D9488",
  tealGradient: "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
  gold: "#D97706",
  danger: "#EF4444",
  border: "#E2E8F0",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
  shadowHover: "0 8px 25px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
  radius: 12,
  radiusLarge: 16,
};

const PIE_COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#D97706", "#EF4444", "#14B8A6"];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// Aligné sur models.Depense.CATEGORIES
const CATEGORIES = {
  MATERIEL: { label: "Matériel", bg: "#EFF6FF", fg: "#2563EB" },
  MISSION: { label: "Mission", bg: "#F5F3FF", fg: "#7C3AED" },
  SANTE: { label: "Santé", bg: "#ECFDF5", fg: "#059669" },
  EVENEMENT: { label: "Événement", bg: "#FEF3C7", fg: "#B45309" },
  FOURNITURE: { label: "Fourniture", bg: "#FDF2F8", fg: "#DB2777" },
  AUTRE: { label: "Autre", bg: "#F3F4F6", fg: "#6B7280" },
};

// Aligné sur models.Depense.PAYMENT_METHODS
const PAYMENT_LABELS = {
  ESPECES: "Espèces",
  VIREMENT: "Virement",
  MOBILE_MONEY: "Mobile Money",
  CHEQUE: "Chèque",
  CARTE: "Carte Bancaire",
};

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
  return new Intl.NumberFormat("fr-FR").format(Math.round(num));
};

const GLOBAL_CSS = `
  .mono { font-feature-settings: "tnum"; font-variant-numeric: tabular-nums; }
  * { box-sizing: border-box; }
`;

/** Récupère l'ID employé (string ou objet) */
const getEmployeeId = (empOrId) => {
  if (!empOrId) return "";
  if (typeof empOrId === "object") return String(empOrId.id || empOrId.pk || "");
  return String(empOrId);
};

/** Affiche "Prénom Nom" */
const resolveEmployeeName = (empOrId, employeesList = []) => {
  if (!empOrId) return "—";
  if (typeof empOrId === "object" && (empOrId.prenom || empOrId.nom)) {
    return `${empOrId.prenom || ""} ${empOrId.nom || ""}`.trim() || "—";
  }
  const id = getEmployeeId(empOrId);
  const found = employeesList.find((e) => String(e.id) === id);
  if (found) return `${found.prenom || ""} ${found.nom || ""}`.trim() || id;
  return id || "—";
};

/* ================= UI ================= */

const Card = ({ children, style }) => (
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
  >
    {children}
  </motion.div>
);

const PageTitle = ({ title, sub, action }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      flexWrap: "wrap",
      gap: 12,
    }}
  >
    <div>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {title}
      </h1>
      {sub && (
        <p style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 4 }}>{sub}</p>
      )}
    </div>
    {action}
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

const CategoryBadge = ({ cat }) => {
  const c = CATEGORIES[cat] || CATEGORIES.AUTRE;
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
};

const Field = ({ label, children, error, full }) => (
  <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
    <label
      style={{
        display: "block",
        fontSize: 11.5,
        fontWeight: 600,
        color: C.ink,
        marginBottom: 6,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </label>
    {children}
    {error && (
      <div style={{ fontSize: 11.5, color: C.danger, marginTop: 4 }}>{error}</div>
    )}
  </div>
);

const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const success = type === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: success ? "#ECFDF5" : "#FEF2F2",
        border: `1px solid ${success ? "#A7F3D0" : "#FECACA"}`,
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: C.shadowHover,
      }}
    >
      {success ? (
        <CheckCircle2 size={17} color="#059669" />
      ) : (
        <AlertTriangle size={17} color={C.danger} />
      )}
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: success ? "#065F46" : "#991B1B",
        }}
      >
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          marginLeft: 4,
          display: "flex",
        }}
      >
        <X size={14} color="#9CA3AF" />
      </button>
    </motion.div>
  );
};

/* ================= MODAL ================= */

const EMPTY_FORM = {
  date: new Date().toISOString().split("T")[0],
  categorie: "MATERIEL",
  description: "",
  montant: "",
  mode_paiement: "ESPECES",
  employee: "",
  justificatif: "",
};

function ExpenseModal({ open, onClose, onSubmit, editing, employees }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const sortedEmployees = useMemo(
    () =>
      [...(employees || [])].sort((a, b) =>
        `${a.prenom || ""} ${a.nom || ""}`.localeCompare(
          `${b.prenom || ""} ${b.nom || ""}`,
          "fr"
        )
      ),
    [employees]
  );

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          date: editing.date
            ? String(editing.date).split("T")[0]
            : EMPTY_FORM.date,
          categorie: editing.categorie || "MATERIEL",
          description: editing.description || "",
          montant: editing.montant ?? "",
          mode_paiement: editing.mode_paiement || "ESPECES",
          employee: getEmployeeId(editing.employee),
          justificatif: editing.justificatif || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, editing]);

  const validate = () => {
    const errs = {};
    if (!form.description.trim()) errs.description = "Description requise";
    if (!form.montant || Number(form.montant) <= 0)
      errs.montant = "Montant invalide";
    if (!form.date) errs.date = "Date requise";
    if (!form.employee) errs.employee = "Employé requis";
    if (!form.categorie) errs.categorie = "Catégorie requise";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      date: form.date,
      categorie: form.categorie,
      description: form.description.trim(),
      montant: Number(form.montant),
      mode_paiement: form.mode_paiement,
      employee: form.employee,
      justificatif: form.justificatif.trim() || null,
    };
    onSubmit(payload);
  };

  if (!open) return null;

  const inputStyle = (err) => ({
    width: "100%",
    padding: "9px 12px",
    fontSize: 13,
    borderRadius: 8,
    border: `1px solid ${err ? C.danger : C.border}`,
    outline: "none",
    transition: "border-color 0.15s",
    background: "#FAFBFC",
    fontFamily: "inherit",
    boxSizing: "border-box",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: C.radiusLarge,
          width: 520,
          maxWidth: "100%",
          boxShadow: C.shadowHover,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: `1px solid ${C.border}`,
            position: "sticky",
            top: 0,
            background: C.surface,
            borderRadius: `${C.radiusLarge}px ${C.radiusLarge}px 0 0`,
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: `${C.teal}14`,
                color: C.teal,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Receipt size={17} />
            </div>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>
                {editing ? "Modifier la dépense" : "Nouvelle dépense"}
              </div>
              <div style={{ fontSize: 11.5, color: C.inkSoft }}>
                Renseignez les informations
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 6,
              display: "flex",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.border)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <X size={18} color={C.inkSoft} />
          </button>
        </div>

        {/* Body */}
        <form id="expense-form" onSubmit={handleSubmit}>
          <div
            style={{
              padding: 24,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <Field label="Date *" error={errors.date}>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                style={inputStyle(errors.date)}
              />
            </Field>

            <Field label="Catégorie *" error={errors.categorie}>
              <select
                value={form.categorie}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categorie: e.target.value }))
                }
                style={inputStyle(errors.categorie)}
              >
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Description *" error={errors.description} full>
              <input
                value={form.description}
                placeholder="Ex : Achat de fournitures bureautiques"
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                style={inputStyle(errors.description)}
              />
            </Field>

            <Field label="Montant (FCFA) *" error={errors.montant}>
              <input
                type="number"
                min="0"
                step="1"
                value={form.montant}
                onChange={(e) =>
                  setForm((f) => ({ ...f, montant: e.target.value }))
                }
                style={inputStyle(errors.montant)}
              />
            </Field>

            <Field label="Mode de paiement">
              <select
                value={form.mode_paiement}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mode_paiement: e.target.value }))
                }
                style={inputStyle()}
              >
                {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>

            {/* Liste complète de tous les employés */}
            <Field label="Employé concerné *" error={errors.employee} full>
              <select
                value={getEmployeeId(form.employee)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, employee: e.target.value }))
                }
                style={inputStyle(errors.employee)}
              >
                <option value="">— Sélectionner un employé —</option>
                {sortedEmployees.length === 0 && (
                  <option value="" disabled>
                    Aucun employé disponible
                  </option>
                )}
                {sortedEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.prenom} {emp.nom}
                    {emp.poste ? ` · ${emp.poste}` : ""}
                    {emp.departement ? ` (${emp.departement})` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Justificatif (réf.)" full>
              <input
                value={form.justificatif}
                placeholder="N° facture, reçu…"
                onChange={(e) =>
                  setForm((f) => ({ ...f, justificatif: e.target.value }))
                }
                style={inputStyle()}
              />
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "16px 24px",
            borderTop: `1px solid ${C.border}`,
            position: "sticky",
            bottom: 0,
            background: C.surface,
            borderRadius: `0 0 ${C.radiusLarge}px ${C.radiusLarge}px`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.surface,
              color: C.inkSoft,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="expense-form"
            style={{
              padding: "9px 22px",
              borderRadius: 8,
              border: "none",
              background: C.tealGradient,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(15,118,110,0.25)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-1px)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            {editing ? "Enregistrer" : "Ajouter la dépense"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================= SECTION PRINCIPALE ================= */

export default function DepensesSection({
  employees = [],
  depenses = [],
  year,
  monthFilter: monthProp,
  onRefresh,
}) {
  const safeEmps = Array.isArray(employees) ? employees : [];
  const safeDeps = Array.isArray(depenses) ? depenses : [];

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(
    monthProp !== undefined && monthProp !== null ? String(monthProp) : "all"
  );
  const [yearFilter, setYearFilter] = useState(
    year && year !== "all" ? String(year) : "all"
  );
  const [empFilter, setEmpFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const sortedEmployees = useMemo(
    () =>
      [...safeEmps].sort((a, b) =>
        `${a.prenom || ""} ${a.nom || ""}`.localeCompare(
          `${b.prenom || ""} ${b.nom || ""}`,
          "fr"
        )
      ),
    [safeEmps]
  );

  const yearOptions = useMemo(() => {
    const s = new Set();
    for (let y = 2020; y <= 2050; y++) s.add(String(y));
    safeDeps.forEach((d) => {
      if (d.date) {
        const y = new Date(d.date).getFullYear();
        if (!isNaN(y)) s.add(String(y));
      }
    });
    return [...s].sort();
  }, [safeDeps]);

  const filtered = useMemo(() => {
    let list = [...safeDeps];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.description?.toLowerCase().includes(q) ||
          d.categorie?.toLowerCase().includes(q) ||
          d.justificatif?.toLowerCase().includes(q) ||
          resolveEmployeeName(d.employee, safeEmps).toLowerCase().includes(q)
      );
    }

    if (catFilter !== "all") {
      list = list.filter((d) => d.categorie === catFilter);
    }

    if (empFilter !== "all") {
      list = list.filter(
        (d) => getEmployeeId(d.employee) === String(empFilter)
      );
    }

    if (monthFilter !== "all") {
      list = list.filter((d) => {
        try {
          return new Date(d.date).getMonth() === Number(monthFilter);
        } catch {
          return false;
        }
      });
    }

    if (yearFilter !== "all") {
      list = list.filter((d) => {
        try {
          return new Date(d.date).getFullYear() === Number(yearFilter);
        } catch {
          return false;
        }
      });
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [safeDeps, search, catFilter, monthFilter, yearFilter, empFilter, safeEmps]);

  const totalFiltered = filtered.reduce(
    (s, d) => s + Number(d.montant || 0),
    0
  );
  const totalGlobal = safeDeps.reduce(
    (s, d) => s + Number(d.montant || 0),
    0
  );

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach((d) => {
      const key = d.categorie || "AUTRE";
      map[key] = (map[key] || 0) + Number(d.montant || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({
        name: CATEGORIES[name]?.label || name,
        value,
        key: name,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const byMonth = useMemo(
    () =>
      MONTHS.map((m, i) => ({
        mois: m,
        total: filtered
          .filter((d) => {
            try {
              return new Date(d.date).getMonth() === i;
            } catch {
              return false;
            }
          })
          .reduce((s, d) => s + Number(d.montant || 0), 0),
      })),
    [filtered]
  );

  const handleOpenModal = (d = null) => {
    setEditing(d);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await depenseService.update(editing.id, data);
        setToast({ type: "success", message: "Dépense modifiée avec succès" });
      } else {
        await depenseService.create(data);
        setToast({ type: "success", message: "Dépense ajoutée avec succès" });
      }
      handleCloseModal();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object"
          ? Object.values(err.response.data).flat().join(" ")
          : null) ||
        err.message ||
        "Erreur lors de l'enregistrement";
      setToast({ type: "error", message: msg });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette dépense ?")) return;
    try {
      await depenseService.delete(id);
      setToast({ type: "success", message: "Dépense supprimée" });
      if (onRefresh) onRefresh();
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.detail || "Erreur lors de la suppression",
      });
    }
  };

  const selectStyle = {
    padding: "9px 14px",
    fontSize: 13,
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    background: C.surface,
    cursor: "pointer",
    minWidth: 140,
  };

  return (
    <div>
      <style>{GLOBAL_CSS}</style>

      <PageTitle
        title="Gestion des Dépenses"
        sub={`${filtered.length} dépense(s) · Total : ${fmt(totalFiltered)}`}
        action={
          <button
            onClick={() => handleOpenModal()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 9,
              border: "none",
              background: C.tealGradient,
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(15,118,110,0.25)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-1px)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            <Plus size={16} strokeWidth={2.2} /> Ajouter une dépense
          </button>
        }
      />

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <Card style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 500 }}>
            TOTAL FILTRÉ
          </div>
          <div
            className="mono"
            style={{
              fontSize: 21,
              fontWeight: 700,
              color: C.teal,
              marginTop: 4,
            }}
          >
            {fmt(totalFiltered)}
          </div>
        </Card>
        <Card style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 500 }}>
            GLOBAL TOUTES DÉPENSES
          </div>
          <div
            className="mono"
            style={{ fontSize: 21, fontWeight: 700, marginTop: 4 }}
          >
            {fmt(totalGlobal)}
          </div>
        </Card>
        <Card style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 500 }}>
            MOYENNE / DÉPENSE
          </div>
          <div
            className="mono"
            style={{ fontSize: 21, fontWeight: 700, marginTop: 4 }}
          >
            {filtered.length ? fmt(totalFiltered / filtered.length) : fmt(0)}
          </div>
        </Card>
        <Card style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 500 }}>
            CATÉGORIE DOMINANTE
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginTop: 6,
              color: C.gold,
            }}
          >
            {byCategory[0]?.name || "—"}
          </div>
        </Card>
      </div>

      {/* Graphiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Card>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>
              Dépenses par catégorie
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={86}
                paddingAngle={3}
                strokeWidth={0}
              >
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11.5 }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>
              Évolution mensuelle
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byMonth}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.border}
                vertical={false}
              />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.inkSoft }} />
              <YAxis
                tick={{ fontSize: 11, fill: C.inkSoft }}
                tickFormatter={fmtShort}
                width={60}
              />
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="total"
                fill={C.teal}
                radius={[5, 5, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filtres */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search
            size={15}
            color={C.inkLight}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (description, catégorie, employé)…"
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              fontSize: 13,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              outline: "none",
              background: C.surface,
              boxSizing: "border-box",
            }}
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        {/* Liste complète de tous les employés */}
        <select
          value={empFilter}
          onChange={(e) => setEmpFilter(e.target.value)}
          style={{ ...selectStyle, minWidth: 180 }}
        >
          <option value="all">Tous les employés</option>
          {sortedEmployees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.prenom} {e.nom}
            </option>
          ))}
        </select>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">Tous les mois</option>
          {MONTHS.map((m, i) => (
            <option key={i} value={String(i)}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">Toutes les années</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {typeof onRefresh === "function" && (
          <button
            onClick={onRefresh}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.surface,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
            <RefreshCw size={14} /> Actualiser
          </button>
        )}
      </div>

      {/* Tableau */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <TH pad="12px 24px">Date</TH>
                <TH>Catégorie</TH>
                <TH>Description</TH>
                <TH align="right">Montant</TH>
                <TH>Paiement</TH>
                <TH>Employé</TH>
                <TH align="center" pad="12px 24px">
                  Actions
                </TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FAFBFC")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "12px 24px",
                      fontSize: 13,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.date
                      ? new Date(d.date).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <CategoryBadge cat={d.categorie} />
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      maxWidth: 260,
                    }}
                  >
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.description}
                    </div>
                    {d.justificatif && (
                      <div
                        style={{
                          fontSize: 11,
                          color: C.inkLight,
                          marginTop: 2,
                        }}
                      >
                        Réf. {d.justificatif}
                      </div>
                    )}
                  </td>
                  <td
                    className="mono"
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.ink,
                    }}
                  >
                    {fmtShort(d.montant)}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12.5,
                      color: C.inkSoft,
                    }}
                  >
                    {PAYMENT_LABELS[d.mode_paiement] ||
                      d.mode_paiement ||
                      "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12.5,
                      color: C.inkSoft,
                    }}
                  >
                    {resolveEmployeeName(d.employee, safeEmps)}
                  </td>
                  <td
                    style={{
                      padding: "12px 24px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      onClick={() => handleOpenModal(d)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 7,
                        borderRadius: 6,
                        marginRight: 4,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = `${C.teal}14`)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Pencil size={14} color={C.teal} />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 7,
                        borderRadius: 6,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(220,38,38,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Trash2 size={14} color={C.danger} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 48,
                      textAlign: "center",
                      color: C.inkSoft,
                    }}
                  >
                    <Receipt
                      size={32}
                      color={C.inkLight}
                      style={{ marginBottom: 8 }}
                    />
                    <div style={{ fontSize: 13.5 }}>
                      Aucune dépense ne correspond aux filtres
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {showModal && (
          <ExpenseModal
            open={showModal}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            editing={editing}
            employees={safeEmps}
          />
        )}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}