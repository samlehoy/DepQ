import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';

function Layout() {
  const location = useLocation();
  const hideNavOn = ['/quran/']; // Hide bottom nav in reading view
  const isSurahView = location.pathname.startsWith('/quran/');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isSurahView && <Navigation />}
    </div>
  );
}

export default Layout;
