import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  console.log('📤 Tentative de login avec:', formData);

  try {
    const success = await login(formData);
    console.log('📥 Résultat login:', success);
    
    if (success) {
      console.log('✅ Connexion réussie, redirection...');
      navigate('/');
    } else {
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  } catch (err) {
    console.error('❌ Erreur complète:', err);
    console.error('❌ Détails erreur:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: err.config
    });
    setError('Erreur de connexion au serveur. Vérifiez que le backend est lancé.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2F6F5E 0%, #1F4F42 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'fadeInUp 0.5s ease',
      }}>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2F6F5E 0%, #4A8F7E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(47,111,94,0.3)',
          }}>
            <span style={{ fontSize: '40px' }}>🏢</span>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2F6F5E 0%, #C08A3E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            fontFamily: 'Fraunces, serif',
          }}>Pilotage RH</h1>
          <p style={{ color: '#5B6577', marginTop: '8px', fontSize: '14px' }}>
            Gestion des Ressources Humaines
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FBEAE7',
            color: '#B4483C',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '14px',
            border: '1px solid #F5D0CB',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#16233D',
              marginBottom: '6px',
              letterSpacing: '0.04em',
            }}>
              👤 Nom d'utilisateur
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="Entrez votre nom d'utilisateur"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #E4E7ED',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                background: 'rgba(255,255,255,0.8)',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2F6F5E';
                e.target.style.boxShadow = '0 0 0 3px rgba(47,111,94,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E4E7ED';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#16233D',
              marginBottom: '6px',
              letterSpacing: '0.04em',
            }}>
              🔒 Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Entrez votre mot de passe"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #E4E7ED',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: 'rgba(255,255,255,0.8)',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2F6F5E';
                  e.target.style.boxShadow = '0 0 0 3px rgba(47,111,94,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E4E7ED';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: '18px',
                  color: '#94A3B8',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#2F6F5E';
                  e.target.style.background = 'rgba(47,111,94,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#94A3B8';
                  e.target.style.background = 'transparent';
                }}
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: loading ? '#A0A0A0' : 'linear-gradient(135deg, #2F6F5E 0%, #4A8F7E 100%)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(47,111,94,0.3)',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 32px rgba(47,111,94,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(47,111,94,0.3)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Connexion...
              </span>
            ) : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{
            fontSize: '12px',
            color: '#5B6577',
            borderTop: '1px solid #E4E7ED',
            paddingTop: '20px',
          }}>
            🔐 Utilisez les identifiants du superutilisateur
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;