import React from 'react';
import MobileLayout from '../../components/Layout/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <MobileLayout title="My Profile">
      <div className="bg-[#0052FF] text-white p-6 pb-12 rounded-b-3xl relative">
        <h2 className="text-2xl font-bold mb-1">Profile Details</h2>
        <p className="text-blue-100 text-sm">Manage your account and settings</p>
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              <img src={`https://ui-avatars.com/api/?name=${user?.name?.replace(' ', '+')}&background=0D8ABC&color=fff&size=128`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <User className="text-blue-500 mr-3" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Full Name</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Mail className="text-blue-500 mr-3" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email Address</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Shield className="text-blue-500 mr-3" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Account Role</p>
                <p className="font-semibold text-gray-900">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-bold flex justify-center items-center hover:bg-red-100 transition"
        >
          <LogOut size={18} className="mr-2" /> Log Out
        </button>
      </div>
    </MobileLayout>
  );
};

export default Profile;
