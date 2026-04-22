import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const { error } = await signUp(email, password, {
        data: { full_name: name }
      });
      if (error) throw error;
      
      // Usually, email confirmation is sent. For now, navigate to login
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: implement real google auth
    navigate('/');
  };

  return (
    <div className="bg-white font-sans min-h-screen">
      <div className="max-w-md mx-auto">
        <div className="min-h-screen flex flex-col justify-center p-8">
          
          <div className="text-center mb-10">
            <h1 className="text-6xl font-extrabold text-teal-800">DepQ</h1>
          </div>

          <h2 className="text-xl font-regular text-slate-800 mb-4">Register</h2>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form className="w-full space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="font-semibold text-sm text-slate-600 block">Name</label>
              <input 
                type="text" 
                name="name" 
                required
                placeholder="Eleonore" 
                className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
              />
            </div>
            <div>
              <label className="font-semibold text-sm text-slate-600 block">Password</label>
              <input 
                type="password" 
                name="password" 
                required
                placeholder="**************" 
                className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
              />
            </div>
            <div>
              <label className="font-semibold text-sm text-slate-600 block">E-mail</label>
              <input 
                type="email" 
                name="email" 
                required
                placeholder="eleonore@gmail.com" 
                className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
              />
            </div>
            <div className="text-right">
              <Link to="/login" className="font-semibold text-sm text-teal-800 hover:underline">Login now</Link>
            </div>

            <div className="w-full mt-12 space-y-4 pt-8">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-800 text-white font-bold py-4 px-4 rounded-xl transition duration-300 shadow-lg shadow-teal-600/20 disabled:opacity-70"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
              <button 
                type="button"
                onClick={() => setShowGoogleModal(true)} 
                className="w-full bg-[#4DB6AC] hover:bg-opacity-90 text-white font-bold py-4 px-4 rounded-xl transition duration-300 flex items-center justify-center shadow-lg shadow-[#4DB6AC]/20"
              >
                <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.651-3.657-11.303-8H6.399C9.656,39.663,16.318,44,24,44z"></path>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>

        </div>
      </div>

      {showGoogleModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setShowGoogleModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full transition-all"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center text-slate-800">Pilih akun</h2>
            <p className="text-sm text-slate-500 text-center mt-1 mb-6">untuk melanjutkan ke DepQ</p>
            
            <div onClick={handleGoogleLogin} className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
              <img src="https://i.pravatar.cc/300?img=1" alt="User" className="w-10 h-10 rounded-full" />
              <div className="ml-4">
                <p className="font-semibold text-slate-700">Eleonore</p>
                <p className="text-sm text-slate-500">eleonore@gmail.com</p>
              </div>
            </div>

            <div onClick={handleGoogleLogin} className="flex items-center p-3 mt-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <img src="https://i.pravatar.cc/300?img=2" alt="User" className="w-10 h-10 rounded-full" />
              <div className="ml-4">
                <p className="font-semibold text-slate-700">Pena</p>
                <p className="text-sm text-slate-500">pena@gmail.com</p>
              </div>
            </div>
            
            <div onClick={handleGoogleLogin} className="flex items-center p-3 mt-4 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <div className="ml-4">
                <p className="font-semibold text-slate-700">Gunakan akun lain</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
