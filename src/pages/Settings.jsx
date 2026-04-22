import { Link, useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, Info, LogOut, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Settings() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col mb-12">
      <header className="bg-white shadow-sm p-4 z-10 sticky top-0 flex items-center justify-center relative">
        <h1 className="text-xl font-bold text-teal-600 text-center">Pengaturan</h1>
      </header>

      <main className="max-w-lg w-full mx-auto p-4 flex-grow space-y-6">
        {/* Profile Card */}
        <Link 
          to="/profile" 
          className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group hover:bg-teal-50 transition-colors"
        >
          <div className="relative w-16 h-16 flex-shrink-0">
            <img 
              src="https://i.pravatar.cc/128?u=fatima" 
              alt="Foto Profil" 
              className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/128x128/E0E0E0/FFFFFF?text=FE'; }}
            />
          </div>
          <div className="flex-grow overflow-hidden">
            <h2 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300 truncate">
              {user?.user_metadata?.full_name || 'User DepQ'}
            </h2>
            <p className="text-sm text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
        </Link>

        {/* Settings Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-semibold text-gray-700">Notifikasi</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="font-semibold text-gray-700">Bantuan & Masukan</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
                <Info className="w-5 h-5" />
              </div>
              <span className="font-semibold text-gray-700">Tentang Aplikasi</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Logout Button */}
        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl shadow-sm bg-white border border-red-100 hover:bg-red-50 transition-colors text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold">Keluar</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default Settings;
