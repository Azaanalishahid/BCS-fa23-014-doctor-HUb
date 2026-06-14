import React from 'react';
import BottomNav from './BottomNav';
import { useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';

const MobileLayout: React.FC<{ children: React.ReactNode, hideBottomNav?: boolean, headerRight?: React.ReactNode, title?: string }> = ({ children, hideBottomNav, headerRight, title }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans sm:bg-gray-100 flex justify-center">
      <div className="w-full max-w-md lg:max-w-full bg-white min-h-screen shadow-xl relative flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white sticky top-0 z-10 shadow-lg">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{title || 'Doctor Hub'}</h1>
                <p className="text-xs text-blue-100">Healthcare Platform</p>
              </div>
            </div>
            {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 bg-gray-50">
          <div className="px-4 pt-4">
            {children}
          </div>
        </main>

        {/* Bottom Navigation */}
        {!hideBottomNav && <BottomNav currentPath={location.pathname} />}
        
      </div>
    </div>
  );
};

export default MobileLayout;
