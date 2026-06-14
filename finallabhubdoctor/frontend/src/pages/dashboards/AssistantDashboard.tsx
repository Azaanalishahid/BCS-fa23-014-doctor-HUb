import React, { useState, useEffect } from 'react';
import MobileLayout from '../../components/Layout/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { CheckCircle, Eye, XCircle, Clock, Search } from 'lucide-react';

const AssistantDashboard = () => {
  const { user, logout } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const { data } = await api.get('/payments/pending');
      setPayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (appointmentId: number) => {
    if (!window.confirm('Are you sure you want to verify this payment?')) return;
    try {
      await api.put(`/appointments/verify/${appointmentId}`);
      alert('Payment verified successfully. Appointment is confirmed.');
      fetchPendingPayments();
    } catch (err) {
      console.error(err);
      alert('Failed to verify payment.');
    }
  };

  const handleReject = async (appointmentId: number) => {
    if (!window.confirm('Are you sure you want to REJECT this payment?')) return;
    try {
      await api.delete(`/appointments/reject/${appointmentId}`);
      alert('Payment rejected successfully. Patient will need to re-upload.');
      fetchPendingPayments();
    } catch (err) {
      console.error(err);
      alert('Failed to reject payment.');
    }
  };

  return (
    <MobileLayout title="MedCore Central" headerRight={<button onClick={logout} className="text-xs text-red-500 font-medium bg-red-50 px-3 py-1.5 rounded-full">Logout</button>}>
      
      <div className="bg-[#0052FF] text-white p-6 pb-12 rounded-b-3xl relative">
        <h2 className="text-2xl font-bold mb-1">Verifications</h2>
        <p className="text-blue-100 text-sm">Review pending payments</p>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
          <input 
            type="text" 
            placeholder="Search by patient name..." 
            className="w-full pl-9 pr-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm focus:outline-none placeholder-white/50 text-white"
          />
        </div>
      </div>

      <div className="px-4 -mt-6 pb-6">

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">{payments.length}</span> Pending</p>
        </div>

        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
               
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <h4 className="font-bold text-gray-900 text-sm">{payment.patient_name}</h4>
                   <p className="text-xs text-gray-500 mt-0.5">Blood Group: <span className="font-medium text-gray-700">{payment.blood_group}</span></p>
                   <p className="text-xs text-gray-500 flex items-center mt-1"><Clock size={12} className="mr-1"/> {payment.date} at {payment.time}</p>
                 </div>
               </div>

               <div className="mt-3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative cursor-pointer" onClick={() => setSelectedScreenshot(`http://localhost:5000${payment.screenshot_url}`)}>
                 <div className="aspect-video bg-gray-200 relative">
                   <img src={`http://localhost:5000${payment.screenshot_url}`} alt="Payment Screenshot" className="w-full h-full object-cover opacity-80" />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                     <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm">
                       <Eye size={14} className="mr-1"/> View Receipt
                     </div>
                   </div>
                 </div>
               </div>

               <div className="flex gap-2 mt-4">
                 <button 
                   onClick={() => handleReject(payment.appointment_id)}
                   className="flex-1 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 flex justify-center items-center"
                 >
                   <XCircle size={16} className="mr-1"/> Reject
                 </button>
                 <button 
                   onClick={() => handleVerify(payment.appointment_id)}
                   className="flex-[2] py-2.5 rounded-xl text-sm font-medium text-white bg-green-500 hover:bg-green-600 shadow-md shadow-green-500/20 flex justify-center items-center"
                 >
                   <CheckCircle size={16} className="mr-1"/> Verify Payment
                 </button>
               </div>
            </div>
          ))}

          {payments.length === 0 && (
            <div className="text-center p-8 bg-blue-50 rounded-xl border border-blue-100 border-dashed mt-4">
               <h3 className="font-bold text-gray-900">All Caught Up!</h3>
               <p className="text-xs text-gray-500 mt-2">There are no pending payments to verify.</p>
            </div>
          )}
        </div>

      </div>

      {/* Screenshot Modal Overlay inline */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
             <div className="flex justify-between items-center p-4 border-b border-gray-100">
               <h3 className="font-bold text-gray-900">Payment Screenshot</h3>
               <button onClick={() => setSelectedScreenshot(null)} className="text-gray-500 bg-gray-100 p-1 rounded-full"><XCircle size={20}/></button>
             </div>
             <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
               <img src={selectedScreenshot} alt="Payment Screenshot" className="w-full rounded-lg border border-gray-200" />
             </div>
           </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default AssistantDashboard;
