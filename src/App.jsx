import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import UstadzRoute from './components/UstadzRoute';
import Home from './pages/Home';
import Quran from './pages/Quran';
import Surah from './pages/Surah';
import Setoran from './pages/Setoran';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Quote from './pages/Quote';
import QuoteDetail from './pages/QuoteDetail';
import UstadzDashboard from './pages/UstadzDashboard';

function App() {
  return (
    <Routes>
      {/* Auth Routes — no navigation shell */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        {/* Surah Reader — standalone immersive layout */}
        <Route path="/quran/:id" element={<Surah />} />

        {/* Main App Routes — sidebar + topbar + bottom nav */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quran" element={<Quran />} />
          <Route path="setoran" element={<Setoran />} />
          <Route path="history" element={<History />} />
          <Route path="quote" element={<Quote />} />
          <Route path="quote/:id" element={<QuoteDetail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Ustadz Only Routes */}
          <Route element={<UstadzRoute />}>
            <Route path="ustadz" element={<UstadzDashboard />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
