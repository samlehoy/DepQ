import { Link } from 'react-router-dom';
import { quotesData } from '../data/quotes';

function Quote() {
  const quoteKeys = Object.keys(quotesData);

  return (
    <div className="px-6 py-8 md:px-10 w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-lg text-[var(--ds-primary)] tracking-tight mb-2">Quotes</h1>
        <p className="text-body-main text-[var(--ds-outline)]">Wisdom from the Qur'an</p>
      </div>

      <div className="space-y-4">
        {quoteKeys.map((key) => {
          const quote = quotesData[key];
          return (
            <Link
              key={key}
              to={`/quote/${key}`}
              className="group block glass-card rounded-xl p-5 hover:shadow-lg hover:border-[var(--ds-primary)]/20 transition-all"
            >
              <h2 className="text-body-main font-bold text-[var(--ds-on-surface)] group-hover:text-[var(--ds-primary)] transition-colors">{quote.title}</h2>
              <p className="text-caption text-[var(--ds-outline)] mt-1 line-clamp-2">{quote.text}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Quote;
