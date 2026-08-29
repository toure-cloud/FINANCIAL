import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

const C = {
  surface: "#FFFFFF",
  ink: "#0F172A",
  inkSoft: "#475569",
  teal: "#0D9488",
  danger: "#EF4444",
  border: "#E2E8F0",
  shadowHover: "0 8px 25px rgba(0,0,0,0.08)",
  radiusLarge: 16,
};

export default function ResultModal({ open, type = "success", title, message, onClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  const success = type === "success";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(3px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 12 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.surface,
            borderRadius: C.radiusLarge,
            width: 400,
            maxWidth: "100%",
            padding: "28px 24px 20px",
            boxShadow: C.shadowHover,
            textAlign: "center",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={18} color={C.inkSoft} />
          </button>

          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              margin: "0 auto 16px",
              background: success ? "#ECFDF5" : "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {success ? (
              <CheckCircle2 size={28} color="#059669" />
            ) : (
              <AlertTriangle size={28} color={C.danger} />
            )}
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
            {title || (success ? "Opération réussie" : "Échec de l'opération")}
          </div>
          <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.5 }}>
            {message ||
              (success
                ? "Les modifications ont été enregistrées."
                : "Une erreur est survenue. Réessayez.")}
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: 20,
              padding: "10px 28px",
              borderRadius: 8,
              border: "none",
              background: success
                ? "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)"
                : C.danger,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}