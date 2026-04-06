import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur de connexion');
        setLoading(false);
        return;
      }

      const { token, email: userEmail } = await res.json();
      localStorage.setItem('endo-token', token);
      localStorage.setItem('endo-user', userEmail);
      onLogin(token);
    } catch {
      setError('Erreur réseau');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <span className="login-emoji-main">🦷</span>
            <span className="login-emoji-sub">🔬</span>
          </div>
          <h1 className="login-title">Endodontic<br />Literature Review</h1>
          <p className="login-subtitle">Veille scientifique en endodontie</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoFocus
            />
          </div>
          <div className="login-field">
            <label className="login-label">Mot de passe</label>
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="login-footer">Accès réservé aux praticiens</p>
      </div>
    </div>
  );
}
