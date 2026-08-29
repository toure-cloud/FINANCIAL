/* ============================================================
   THEME.JS — Design System centralisé
   Source unique de vérité pour couleurs, formats et animations
   ============================================================ */

export const C = {
  // Fond & surfaces
  bg: "#F0F2F5",
  bgGradient: "linear-gradient(135deg, #F0F2F5 0%, #E8EAED 100%)",
  surface: "#FFFFFF",

  // Texte
  ink: "#1A1D2E",
  inkSoft: "#6B7280",
  inkLight: "#9CA3AF",

  // Couleurs de marque
  teal: "#0F766E",
  tealLight: "#14B8A6",
  tealDark: "#0D5C56",
  tealGradient: "linear-gradient(135deg, #0F766E 0%, #0D5C56 100%)",
  gold: "#B45309",
  goldLight: "#D97706",
  goldGradient: "linear-gradient(135deg, #B45309 0%, #92400E 100%)",
  blue: "#2563EB",
  purple: "#7C3AED",
  danger: "#DC2626",

  // Bordures & ombres
  border: "#E5E7EB",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowHover: "0 10px 40px rgba(0,0,0,0.08)",

  // Rayons
  radius: 12,
  radiusLarge: 16,
};

export const PIE_COLORS = ["#0F766E", "#B45309", "#2563EB", "#7C3AED", "#DC2626", "#6B7280"];

export const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];

export const CAT_COLORS = {
  MATERIEL:   { bg: "#EFF6FF", fg: "#2563EB" },
  MISSION:    { bg: "#FEF3C7", fg: "#B45309" },
  SANTE:      { bg: "#ECFDF5", fg: "#059669" },
  EVENEMENT:  { bg: "#F5F3FF", fg: "#7C3AED" },
  FOURNITURE: { bg: "#FDF2F8", fg: "#DB2777" },
  AUTRE:      { bg: "#F3F4F6", fg: "#6B7280" },
};

export const PAYMENT_LABELS = {
  ESPECES: "Espèces",
  VIREMENT: "Virement",
  MOBILE_MONEY: "Mobile Money",
  CHEQUE: "Chèque",
};

/* ---------- Formatage ---------- */
export const fmt = (n) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(Number(n) || 0)) + " FCFA";

export const fmtShort = (n) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(Number(n) || 0));

/* ---------- Animations partagées ---------- */
export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.25, ease: "easeOut" },
};

/* ---------- CSS global injectable ---------- */
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .mono {
    font-family: 'IBM Plex Mono', 'SF Mono', monospace;
    font-variant-numeric: tabular-nums;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
