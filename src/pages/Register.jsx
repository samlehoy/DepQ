import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

function Register() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;

    if (password !== confirm) { setError(t.passwordMismatch); setLoading(false); return; }
    if (password.length < 6) { setError(t.passwordTooShort); setLoading(false); return; }

    try {
      const { error } = await signUp(email, password, { data: { full_name: name } });
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ds-background)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[var(--ds-primary)] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            <h1 className="text-4xl font-extrabold text-[var(--ds-primary)]">DepQ</h1>
          </div>
          <p className="text-caption text-[var(--ds-outline)] uppercase tracking-widest">{t.memorization_portal}</p>
        </div>

        <h2 className="text-h2-ui text-[var(--ds-on-surface)] mb-6">{t.createAccount}</h2>

        {error && (
          <div className="bg-[var(--ds-error-container)] text-[var(--ds-on-error-container)] p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label htmlFor="name" className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">{t.fullName}</label>
            <input type="text" id="name" name="name" required placeholder="Ahmad Fawzi"
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--ds-surface-container-lowest)] border border-[var(--ds-outline-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ds-primary-fixed-dim)] text-[var(--ds-on-surface)]" />
          </div>
          <div>
            <label htmlFor="email" className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">{t.email}</label>
            <input type="email" id="email" name="email" required placeholder="you@example.com"
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--ds-surface-container-lowest)] border border-[var(--ds-outline-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ds-primary-fixed-dim)] text-[var(--ds-on-surface)]" />
          </div>
          <div>
            <label htmlFor="password" className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">{t.password}</label>
            <input type="password" id="password" name="password" required placeholder="Min 6 characters"
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--ds-surface-container-lowest)] border border-[var(--ds-outline-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ds-primary-fixed-dim)] text-[var(--ds-on-surface)]" />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-caption text-[var(--ds-on-surface)] mb-2 uppercase tracking-wider">{t.confirmPassword}</label>
            <input type="password" id="confirm" name="confirm" required placeholder="••••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--ds-surface-container-lowest)] border border-[var(--ds-outline-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ds-primary-fixed-dim)] text-[var(--ds-on-surface)]" />
          </div>
          <div className="text-right">
            <Link to="/login" className="text-caption text-[var(--ds-primary)] hover:underline font-semibold">{t.alreadyHaveAccount}</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[var(--ds-primary)] text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>{t.creatingAccount}</> : t.createAccount}
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--ds-outline-variant)]/40"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--ds-background)] text-[var(--ds-outline)] text-caption">OR</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full bg-[var(--ds-surface)] border border-[var(--ds-outline-variant)] text-[var(--ds-on-surface)] font-bold py-4 rounded-xl hover:bg-[var(--ds-surface-container)] transition-all shadow-sm flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            {t.continueWithGoogle}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="w-full bg-[var(--ds-surface-container)] text-[var(--ds-on-surface)] font-bold py-4 rounded-xl hover:bg-[var(--ds-surface-container-high)] transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
            {t.continueAsGuest}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
