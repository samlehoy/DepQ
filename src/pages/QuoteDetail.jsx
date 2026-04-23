import { useParams, Link, Navigate } from 'react-router-dom';
import { quotesData } from '../data/quotes';

function QuoteDetail() {
  const { id } = useParams();
  const quote = quotesData[id];

  if (!quote) {
    return <Navigate to="/quote" replace />;
  }

  return (
    <div className="px-6 py-8 md:px-10 w-full max-w-3xl mx-auto">
      {/* Back */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/quote" className="p-2 text-[var(--ds-primary)] hover:bg-[var(--ds-surface-container)] rounded-xl transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-h2-ui text-[var(--ds-primary)]">Detail Quote</h1>
      </div>

      {/* Hero Image */}
      <div className="w-full h-64 rounded-2xl overflow-hidden relative mb-6 shadow-[var(--shadow-card)]">
        <img
          src="https://akcdn.detik.net.id/visual/2022/04/13/ilustrasi-alquran-2_169.jpeg?w=650&q=80"
          alt="Masjid Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ds-primary)]/60 to-transparent" />
      </div>

      <div className="space-y-4">
        <div className="bg-[var(--ds-primary-container)] text-[var(--ds-on-primary-container)] p-6 rounded-xl shadow-sm">
          <h2 className="text-h2-ui mb-2">{quote.title}</h2>
          <p className="text-body-main opacity-90">{quote.text}</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-body-main font-bold text-[var(--ds-on-surface)] mb-2">Petunjuk Ilahi</h2>
          <p className="text-body-main text-[var(--ds-on-surface-variant)] leading-relaxed">{quote.petunjuk}</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-body-main font-bold text-[var(--ds-on-surface)] mb-2">Pentingnya Pemahaman</h2>
          <p className="text-body-main text-[var(--ds-on-surface-variant)] leading-relaxed">{quote.pemahaman}</p>
        </div>
      </div>
    </div>
  );
}

export default QuoteDetail;
