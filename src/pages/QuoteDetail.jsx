import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { quotesData } from '../data/quotes';

function QuoteDetail() {
  const { id } = useParams();
  const quote = quotesData[id];

  if (!quote) {
    return <Navigate to="/quote" replace />;
  }

  return (
    <>
      <header className="bg-white shadow-sm p-4 z-10 sticky top-0 flex items-center justify-center relative">
        <Link to="/quote" className="absolute left-4 text-teal-600 hover:text-teal-800">
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </Link>
        <h1 className="text-xl font-bold text-teal-600 text-center">Detail Quote</h1>
      </header>

      <main className="flex-grow p-0 space-y-4 max-w-lg mx-auto w-full">
        <div className="w-full h-64 bg-gray-300 overflow-hidden relative">
          <img 
            src="https://akcdn.detik.net.id/visual/2022/04/13/ilustrasi-alquran-2_169.jpeg?w=650&q=80" 
            alt="Masjid Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-teal-600 text-white p-4 rounded-lg shadow-md">
            <h2 className="font-bold text-lg mb-1">{quote.title}</h2>
            <p className="text-sm">{quote.text}</p>
          </div>

          <div className="bg-white text-gray-800 p-4 rounded-lg shadow-md border border-gray-200 relative">
            <h2 className="font-bold text-lg mb-2">Petunjuk Ilahi</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{quote.petunjuk}</p>
          </div>

          <div className="bg-white text-gray-800 p-4 rounded-lg shadow-md border border-gray-200 relative">
            <h2 className="font-bold text-lg mb-2">Pentingnya Pemahaman</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{quote.pemahaman}</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default QuoteDetail;
