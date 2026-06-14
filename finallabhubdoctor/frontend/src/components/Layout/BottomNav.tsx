import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, History, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BottomNav: React.FC<{ currentPath: string }> = ({ currentPath }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getBaseRoute = () => {
    if (!user) return '/login';
    if (user.role === 'Patient') return '/patient';
    if (user.role === 'Doctor') return '/doctor';
    if (user.role === 'Assistant') return '/assistant';
    return '/';
  };

  const base = getBaseRoute();

  const navItems = [
    { name: 'Home', icon: Home, path: base },
    { name: 'Search', icon: Search, path: `${base}/search`, hideRoles: ['Assistant'] },
    { name: 'History', icon: History, path: `${base}/history`, hideRoles: ['Assistant'] },
    { name: 'Profile', icon: User, path: `${base}/profile` },
  ];

  const visibleItems = navItems.filter(item => !item.hideRoles?.includes(user?.role || ''));

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center py-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path || (currentPath === '/' && item.path === base);
        
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center w-16"
          >
            <div className={`p-2 rounded-full mb-1 transition-colors ${isActive ? 'bg-[#50E3C2]' : 'bg-transparent'}`}>
              <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] ${isActive ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
