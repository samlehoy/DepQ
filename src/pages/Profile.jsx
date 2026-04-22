import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const updates = {};
      
      if (formData.email !== user.email) {
        updates.email = formData.email;
      }
      
      if (formData.password) {
        updates.password = formData.password;
      }

      if (formData.name !== user.user_metadata?.full_name) {
        updates.data = { full_name: formData.name };
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase.auth.updateUser(updates);
        if (updateError) throw updateError;
        setSuccess(true);
        setTimeout(() => navigate('/settings'), 1500);
      } else {
        navigate('/settings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col mb-12">
      <header className="bg-white shadow-sm p-4 z-10 sticky top-0 flex items-center justify-center relative">
        <Link to="/settings" className="absolute left-4 text-teal-600 hover:text-teal-800 transition-colors">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </Link>
        <h1 className="text-xl font-bold text-teal-600 text-center">Edit Profil</h1>
      </header>

      <main className="max-w-lg w-full mx-auto p-6 flex-grow">
        <div className="relative w-28 h-28 mx-auto mb-8 mt-4">
          <img 
            src="https://i.pravatar.cc/128?u=fatima" 
            alt="Foto Profil" 
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/128x128/E0E0E0/FFFFFF?text=FE'; }}
          />
          <button 
            className="absolute bottom-0 right-0 bg-teal-600 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors text-white"
            title="Ganti Foto"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}
        {success && <div className="bg-teal-50 text-teal-600 p-3 rounded-xl mb-4 text-sm text-center">Profil berhasil diperbarui!</div>}

        <form onSubmit={handleSave} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-gray-800"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-gray-800"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="Kosongkan jika tidak ingin mengubah" 
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-gray-800"
            />
          </div>

          <div className="pt-6 mt-2 border-t border-gray-100">
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-300 shadow-md shadow-teal-600/20 disabled:opacity-70"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Profile;
