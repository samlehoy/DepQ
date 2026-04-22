import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Quote, BookOpen, Bookmark, Settings } from 'lucide-react';
import { motion } from 'motion/react';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/quote', label: 'Quote', icon: Quote },
    { path: '/quran', label: "Qur'an", icon: BookOpen },
    { path: '/setoran', label: 'Hafalan', icon: Bookmark },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
      <div className="flex justify-between items-center bg-white/90 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-14 rounded-xl z-10"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-teal-50 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon 
                className={`relative z-20 w-5 h-5 transition-colors duration-300 ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-600'}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`relative z-20 text-[10px] mt-1 font-medium transition-colors duration-300 ${isActive ? 'text-teal-700' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default Navigation;
