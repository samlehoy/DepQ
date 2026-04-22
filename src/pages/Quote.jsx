import { Link } from 'react-router-dom';
import { quotesData } from '../data/quotes';

function Quote() {
  const quoteKeys = Object.keys(quotesData);

  return (
    <>
      <header className="bg-white shadow-sm p-4 z-10 sticky top-0 flex items-center justify-center relative">
        <h1 className="text-xl font-bold text-teal-600 text-center">Quote</h1>
      </header>

      <main className="max-w-lg w-full mx-auto p-4 flex-grow space-y-4">
        {quoteKeys.map((key) => {
          const quote = quotesData[key];
          return (
            <Link 
              key={key}
              to={`/quote/${key}`}
              className="block bg-teal-600 text-white p-4 rounded-lg shadow-md hover:bg-teal-700 transition-colors"
            >
              <h2 className="font-bold text-lg">{quote.title}</h2>
              <p className="text-sm mt-1">{quote.text}</p>
            </Link>
          );
        })}
      </main>
    </>
  );
}

export default Quote;
