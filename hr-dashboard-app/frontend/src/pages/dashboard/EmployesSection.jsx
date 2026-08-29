import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Search, Users, Mail, Phone,
  Briefcase, Building2, X, CheckCircle2, AlertTriangle,
  User, UserCircle, RefreshCw
} from "lucide-react";
import { employeeService } from '../../services/api';

// ============================================================
// 🎨 THEME
// ============================================================
const C = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  ink: "#0F172A",
  inkSoft: "#475569",
  inkLight: "#94A3B8",
  inkLighter: "#CBD5E1",
  teal: "#0D9488",
  tealLight: "#14B8A6",
  tealDark: "#0F766E",
  tealBg: "rgba(13, 148, 136, 0.08)",
  tealGradient: "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
  gold: "#D97706",
  goldLight: "#F59E0B",
  danger: "#EF4444",
  dangerBg: "rgba(239, 68, 68, 0.08)",
  success: "#059669",
  successBg: "rgba(5, 150, 105, 0.08)",
  border: "#E2E8F0",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
  shadowHover: "0 8px 25px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
  radius: 12,
  radiusLarge: 16,
  radiusSm: 8,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
  if (num >= 1e9) return (num / 1e9).toFixed(1) + " Mrd";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + " M";
  if (num >= 1e3) return (num / 1e3).toFixed(0) + " k";
  return fmt(num);
};

const DEPARTEMENTS = [
  "Direction Générale",
  "Ressources Humaines",
  "Finance & Comptabilité",
  "Informatique / IT",
  "Marketing & Communication",
  "Commercial & Ventes",
  "Production",
  "Logistique",
  "Qualité",
  "Juridique",
  "Autre",
];

const GLOBAL_CSS = `
  .mono { font-feature-settings: "tnum"; font-variant-numeric: tabular-nums; }
  * { box-sizing: border-box; }
`;

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

const Avatar = ({ prenom, nom }) => {
  const initials = `${(prenom || "?")[0]}${(nom || "")[0]}`.toUpperCase();
  const COLORS = ["#0F766E", "#2563EB", "#B45309", "#7C3AED", "#DB2777", "#059669"];
  const idx = ((prenom || "") + (nom || "")).length % COLORS.length;
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        flexShrink: 0,
        background: COLORS[idx],
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
};

const ContractBadge = ({ type }) => {
  const map = {
    CDI: { bg: "#ECFDF5", fg: "#059669" },
    CDD: { bg: "#FEF3C7", fg: "#B45309" },
    STAGE: { bg: "#EFF6FF", fg: "#2563EB" },
    CONSULTANT: { bg: "#F5F3FF", fg: "#7C3AED" },
    FREELANCE: { bg: "#FEF2F2", fg: "#DC2626" },
  };
  const c = map[(type || "").toUpperCase()] || { bg: "#F3F4F6", fg: "#6B7280" };
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
      {type || "—"}
    </span>
  );
};

const Toast = ({ type, message, onClose }) => {
  React.useEffect(() => {
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

const SectionTitle = ({ icon: IconComp, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <IconComp size={14} color={C.teal} />
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: C.inkSoft,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {title}
    </span>
  </div>
);

// ============================================================
// FORMULAIRE
// ============================================================
const EMPTY_FORM = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  poste: "",
  departement: "",
  type_contrat: "CDI",
  salaire: "",
  charges: "",
  primes: "",
  transport: "",
  cout_telephone: "",
  assurance: "",
  avantages: "",
  autres_recurrent: "",
  date_embauche: new Date().toISOString().split("T")[0],
};

function EmployeeModal({ open, onClose, onSubmit, editing }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          nom: editing.nom || "",
          prenom: editing.prenom || "",
          email: editing.email || "",
          telephone: editing.telephone || "",
          poste: editing.poste || "",
          departement: editing.departement || "",
          type_contrat: editing.type_contrat || "CDI",
          salaire: editing.salaire ?? "",
          charges: editing.charges ?? "",
          primes: editing.primes ?? "",
          transport: editing.transport ?? "",
          cout_telephone: editing.cout_telephone ?? "",
          assurance: editing.assurance ?? "",
          avantages: editing.avantages ?? "",
          autres_recurrent: editing.autres_recurrent ?? "",
          date_embauche: editing.date_embauche
            ? String(editing.date_embauche).split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, editing]);

  const validate = () => {
    const errs = {};
    if (!form.nom.trim()) errs.nom = "Nom requis";
    if (!form.prenom.trim()) errs.prenom = "Prénom requis";
    if (!form.poste.trim()) errs.poste = "Poste requis";
    if (!form.departement.trim()) errs.departement = "Département requis";
    if (!form.date_embauche) errs.date_embauche = "Date d'embauche requise";
    if (!form.salaire || Number(form.salaire) <= 0) errs.salaire = "Salaire invalide";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Email invalide";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim() || null,
      telephone: form.telephone.trim() || null,
      poste: form.poste.trim(),
      departement: form.departement.trim(),
      date_embauche: form.date_embauche,
      type_contrat: form.type_contrat,
      salaire: Number(form.salaire) || 0,
      charges: Number(form.charges) || 0,
      primes: Number(form.primes) || 0,
      transport: Number(form.transport) || 0,
      cout_telephone: Number(form.cout_telephone) || 0,
      assurance: Number(form.assurance) || 0,
      avantages: Number(form.avantages) || 0,
      autres_recurrent: Number(form.autres_recurrent) || 0,
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

  const TotalPreview = ({ form }) => {
    const total = [
      "salaire",
      "charges",
      "primes",
      "transport",
      "cout_telephone",
      "assurance",
      "avantages",
      "autres_recurrent",
    ].reduce((s, k) => s + Number(form[k] || 0), 0);
    return (
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 11, color: C.inkSoft }}>Coût mensuel total</div>
        <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: C.teal }}>
          {fmt(total)}
        </div>
      </div>
    );
  };

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
          width: 680,
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
            zIndex: 2,
            borderRadius: `${C.radiusLarge}px ${C.radiusLarge}px 0 0`,
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
              <User size={17} />
            </div>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>
                {editing ? "Modifier l'employé" : "Nouvel employé"}
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
        <form id="employee-form" onSubmit={handleSubmit}>
          {/* Identité */}
          <div style={{ padding: "20px 24px 4px" }}>
            <SectionTitle icon={User} title="Identité" />
          </div>
          <div
            style={{
              padding: "8px 24px 0",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <Field label="Prénom *" error={errors.prenom}>
              <input
                value={form.prenom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, prenom: e.target.value }))
                }
                style={inputStyle(errors.prenom)}
                placeholder="Ex : Amadou"
              />
            </Field>
            <Field label="Nom *" error={errors.nom}>
              <input
                value={form.nom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nom: e.target.value }))
                }
                style={inputStyle(errors.nom)}
                placeholder="Ex : Diop"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                style={inputStyle(errors.email)}
                placeholder="amadou.diop@entreprise.com"
              />
            </Field>
            <Field label="Téléphone">
              <input
                value={form.telephone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, telephone: e.target.value }))
                }
                style={inputStyle()}
                placeholder="07 08 09 10 11"
              />
            </Field>
            <Field label="Date d'embauche *" error={errors.date_embauche}>
              <input
                type="date"
                value={form.date_embauche || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date_embauche: e.target.value }))
                }
                style={inputStyle(errors.date_embauche)}
              />
            </Field>
          </div>

          {/* Poste & Contrat */}
          <div style={{ padding: "20px 24px 4px" }}>
            <SectionTitle icon={Briefcase} title="Poste & Contrat" />
          </div>
          <div
            style={{
              padding: "8px 24px 0",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14,
            }}
          >
            <Field label="Poste *" error={errors.poste}>
              <input
                value={form.poste}
                onChange={(e) =>
                  setForm((f) => ({ ...f, poste: e.target.value }))
                }
                style={inputStyle(errors.poste)}
                placeholder="Ex : Développeur"
              />
            </Field>
            <Field label="Département *" error={errors.departement}>
              <select
                value={form.departement}
                onChange={(e) =>
                  setForm((f) => ({ ...f, departement: e.target.value }))
                }
                style={inputStyle(errors.departement)}
              >
                <option value="">— Sélectionner —</option>
                {DEPARTEMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type de contrat">
              <select
                value={form.type_contrat}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type_contrat: e.target.value }))
                }
                style={inputStyle()}
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="STAGE">STAGE</option>
                <option value="CONSULTANT">CONSULTANT</option>
                <option value="FREELANCE">FREELANCE</option>
              </select>
            </Field>
          </div>

          {/* Rémunération */}
          <div style={{ padding: "20px 24px 4px" }}>
            <SectionTitle
              icon={UserCircle}
              title="Rémunération mensuelle (FCFA)"
            />
          </div>
          <div
            style={{
              padding: "8px 24px 24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14,
            }}
          >
            <Field label="Salaire de base *" error={errors.salaire}>
              <input
                type="number"
                min="0"
                value={form.salaire}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salaire: e.target.value }))
                }
                style={inputStyle(errors.salaire)}
                placeholder="350000"
              />
            </Field>
            <Field label="Charges patronales">
              <input
                type="number"
                min="0"
                value={form.charges}
                onChange={(e) =>
                  setForm((f) => ({ ...f, charges: e.target.value }))
                }
                style={inputStyle()}
                placeholder="105000"
              />
            </Field>
            <Field label="Primes">
              <input
                type="number"
                min="0"
                value={form.primes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, primes: e.target.value }))
                }
                style={inputStyle()}
                placeholder="50000"
              />
            </Field>
            <Field label="Transport">
              <input
                type="number"
                min="0"
                value={form.transport}
                onChange={(e) =>
                  setForm((f) => ({ ...f, transport: e.target.value }))
                }
                style={inputStyle()}
                placeholder="25000"
              />
            </Field>
            <Field label="Coût téléphone">
              <input
                type="number"
                min="0"
                value={form.cout_telephone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cout_telephone: e.target.value }))
                }
                style={inputStyle()}
                placeholder="15000"
              />
            </Field>
            <Field label="Assurance">
              <input
                type="number"
                min="0"
                value={form.assurance}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assurance: e.target.value }))
                }
                style={inputStyle()}
                placeholder="15000"
              />
            </Field>
            <Field label="Avantages divers">
              <input
                type="number"
                min="0"
                value={form.avantages}
                onChange={(e) =>
                  setForm((f) => ({ ...f, avantages: e.target.value }))
                }
                style={inputStyle()}
                placeholder="20000"
              />
            </Field>
            <Field label="Autres récurrents">
              <input
                type="number"
                min="0"
                value={form.autres_recurrent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, autres_recurrent: e.target.value }))
                }
                style={inputStyle()}
                placeholder="0"
              />
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            padding: "16px 24px",
            borderTop: `1px solid ${C.border}`,
            position: "sticky",
            bottom: 0,
            background: C.surface,
            borderRadius: `0 0 ${C.radiusLarge}px ${C.radiusLarge}px`,
          }}
        >
          <TotalPreview form={form} />
          <div style={{ display: "flex", gap: 10 }}>
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
              form="employee-form"
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
              {editing ? "Enregistrer" : "Ajouter l'employé"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// SECTION PRINCIPALE
// ============================================================
export default function EmployesSection({ employees = [], year, onRefresh }) {
  const safeEmps = Array.isArray(employees) ? employees : [];

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthlyRecurring = (e) =>
    Number(e.salaire || 0) +
    Number(e.charges || 0) +
    Number(e.primes || 0) +
    Number(e.transport || 0) +
    Number(e.cout_telephone || 0) +
    Number(e.assurance || 0) +
    Number(e.avantages || 0) +
    Number(e.autres_recurrent || 0);

  const departments = useMemo(
    () => [...new Set(safeEmps.map((e) => e.departement).filter(Boolean))],
    [safeEmps]
  );
  const contracts = useMemo(
    () => [...new Set(safeEmps.map((e) => e.type_contrat).filter(Boolean))],
    [safeEmps]
  );

  const filtered = useMemo(() => {
    let list = [...safeEmps];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.nom?.toLowerCase().includes(q) ||
          e.prenom?.toLowerCase().includes(q) ||
          e.poste?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.telephone?.toLowerCase().includes(q)
      );
    }
    if (deptFilter !== "all")
      list = list.filter((e) => e.departement === deptFilter);
    if (contractFilter !== "all")
      list = list.filter((e) => e.type_contrat === contractFilter);
    return list;
  }, [safeEmps, search, deptFilter, contractFilter]);

  const masseSalariale = filtered.reduce((s, e) => s + monthlyRecurring(e), 0);
  const masseSalarialeAnnuelle = filtered.reduce(
    (s, e) => s + monthlyRecurring(e) * 12,
    0
  );

  const handleOpenModal = (emp = null) => {
    setEditing(emp);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (editing) {
        await employeeService.update(editing.id, data);
        setToast({
          type: "success",
          message: `Employé ${data.prenom} ${data.nom} modifié avec succès`,
        });
      } else {
        await employeeService.create(data);
        setToast({
          type: "success",
          message: `Employé ${data.prenom} ${data.nom} ajouté avec succès`,
        });
      }
      handleCloseModal();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Erreur:", err);
      const msg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object"
          ? Object.values(err.response.data).flat().join(" ")
          : null) ||
        err.message ||
        "Erreur lors de l'enregistrement";
      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const emp = safeEmps.find((e) => e.id === id);
    const name = emp ? `${emp.prenom} ${emp.nom}` : "cet employé";
    if (!window.confirm(`Supprimer ${name} ? Cette action est irréversible.`))
      return;
    setLoading(true);
    try {
      await employeeService.delete(id);
      setToast({
        type: "success",
        message: `Employé ${name} supprimé avec succès`,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Erreur:", err);
      setToast({
        type: "error",
        message:
          err.response?.data?.detail ||
          err.message ||
          "Erreur lors de la suppression",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <style>{GLOBAL_CSS}</style>

      <PageTitle
        title="Gestion des Employés"
        sub={`${filtered.length} employé(s) · Masse salariale mensuelle : ${fmtShort(
          masseSalariale
        )} FCFA`}
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
            <Plus size={16} strokeWidth={2.2} /> Ajouter un employé
          </button>
        }
      />

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <Card style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 500 }}>
            EFFECTIF FILTRÉ
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
            {filtered.length}
          </div>
        </Card>
        <Card style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 500 }}>
            MASSE SALARIALE MENSUELLE
          </div>
          <div
            className="mono"
            style={{ fontSize: 21, fontWeight: 700, marginTop: 4 }}
          >
            {fmtShort(masseSalariale)}
          </div>
        </Card>
        <Card style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 500 }}>
            MASSE SALARIALE ANNUELLE
          </div>
          <div
            className="mono"
            style={{ fontSize: 21, fontWeight: 700, marginTop: 4 }}
          >
            {fmtShort(masseSalarialeAnnuelle)}
          </div>
        </Card>
        <Card style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 500 }}>
            SALAIRE MOYEN / EMPLOYÉ
          </div>
          <div
            className="mono"
            style={{ fontSize: 21, fontWeight: 700, marginTop: 4 }}
          >
            {filtered.length ? fmtShort(masseSalariale / filtered.length) : "0"}
          </div>
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
            placeholder="Rechercher par nom, poste, email ou téléphone…"
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
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{
            padding: "9px 14px",
            fontSize: 13,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: C.surface,
            cursor: "pointer",
            minWidth: 160,
          }}
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
          style={{
            padding: "9px 14px",
            fontSize: 13,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: C.surface,
            cursor: "pointer",
            minWidth: 140,
          }}
        >
          <option value="all">Tous contrats</option>
          {contracts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
          }}
        >
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Tableau */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <TH pad="12px 24px">Employé</TH>
                <TH>Poste</TH>
                <TH>Département</TH>
                <TH>Contrat</TH>
                <TH align="right">Salaire Base</TH>
                <TH align="right">Coût Mensuel Total</TH>
                <TH align="center" pad="12px 24px">
                  Actions
                </TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const coutMensuel = monthlyRecurring(emp);
                return (
                  <tr
                    key={emp.id}
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
                    <td style={{ padding: "12px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Avatar prenom={emp.prenom} nom={emp.nom} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {emp.prenom} {emp.nom}
                          </div>
                          {(emp.email || emp.telephone) && (
                            <div
                              style={{
                                fontSize: 11.5,
                                color: C.inkSoft,
                                marginTop: 2,
                              }}
                            >
                              {emp.email && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    marginRight: 10,
                                  }}
                                >
                                  <Mail size={10} /> {emp.email}
                                </span>
                              )}
                              {emp.telephone && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Phone size={10} /> {emp.telephone}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      {emp.poste || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: C.inkSoft,
                      }}
                    >
                      {emp.departement ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Building2 size={12} /> {emp.departement}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <ContractBadge type={emp.type_contrat} />
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: 13,
                      }}
                    >
                      {fmtShort(emp.salaire)}
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
                      {fmtShort(coutMensuel)}
                    </td>
                    <td
                      style={{
                        padding: "12px 24px",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <button
                        onClick={() => handleOpenModal(emp)}
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
                        onClick={() => handleDelete(emp.id)}
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
                );
              })}
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
                    <Users
                      size={32}
                      color={C.inkLight}
                      style={{ marginBottom: 8 }}
                    />
                    <div style={{ fontSize: 13.5 }}>
                      Aucun employé ne correspond aux filtres
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
          <EmployeeModal
            open={showModal}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            editing={editing}
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