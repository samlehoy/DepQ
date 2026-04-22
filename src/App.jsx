import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
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

function App() {
  return (
    <Routes>
      {/* Auth Routes without bottom navigation */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main App Routes with bottom navigation */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quran" element={<Quran />} />
          <Route path="quran/:id" element={<Surah />} />
          <Route path="setoran" element={<Setoran />} />
          <Route path="history" element={<History />} />
          <Route path="quote" element={<Quote />} />
          <Route path="quote/:id" element={<QuoteDetail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
