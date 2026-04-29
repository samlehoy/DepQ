import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

function PrivateRoute() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // If there is no active session, render the page blurred with a login prompt modal
  if (!session) {
    return (
      <div className="relative w-full h-[80vh] md:h-[calc(100vh-100px)] overflow-hidden rounded-3xl">
        {/* Blurred Content */}
        <div className="pointer-events-none blur-md select-none opacity-80 h-full overflow-hidden">
          <Outlet />
        </div>
        
        {/* Overlay Modal */}
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          {/* Subtle dark overlay for better contrast */}
          <div className="absolute inset-0 bg-[var(--ds-background)]/60 backdrop-blur-[3px]" />
          
          <div className="bg-[var(--ds-surface)] p-8 rounded-3xl shadow-[var(--shadow-modal)] max-w-sm w-full text-center border border-[var(--ds-outline-variant)]/30 relative z-10 animate-fade-in-up">
            <div className="w-16 h-16 bg-[var(--ds-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-3xl text-[var(--ds-primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <h2 className="text-h2-ui text-[var(--ds-on-surface)] mb-2">Login Required</h2>
            <p className="text-caption text-[var(--ds-outline)] mb-8">
              You need to log in to access this page and manage your memorization progress.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-[var(--ds-primary)] text-white font-bold py-3.5 rounded-xl hover:shadow-[0_8px_16px_-4px_var(--ds-primary-shadow)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Go to Login
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full mt-3 text-caption text-[var(--ds-outline)] font-medium py-2 hover:text-[var(--ds-primary)] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the child routes normally
  return <Outlet />;
}

export default PrivateRoute;
