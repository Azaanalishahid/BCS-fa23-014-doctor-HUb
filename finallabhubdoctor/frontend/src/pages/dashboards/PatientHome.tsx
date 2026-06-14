import React, { useState, useEffect, useRef } from 'react';
import MobileLayout from '../../components/Layout/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { AlertTriangle, Mail, CheckCircle, MessageSquare, XCircle, Upload } from 'lucide-react';

const PatientHome = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForAppt, setUploadingForAppt] = useState<number | null>(null);

  // Chat State
  const [messageDoctor, setMessageDoctor] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatText, setChatText] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchHistory();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/history');
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (doctorUserId: number) => {
    try {
      const { data } = await api.get(`/communication/messages/${doctorUserId}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const startChat = (doctorUserId: number, doctorName: string) => {
    setMessageDoctor({ user_id: doctorUserId, name: doctorName });
    setChatText('');
    fetchMessages(doctorUserId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageDoctor || !chatText.trim()) return;
    try {
      await api.post('/communication/message', {
        receiver_id: messageDoctor.user_id,
        content: chatText
      });
      setChatText('');
      fetchMessages(messageDoctor.user_id);
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingForAppt) return;

    const formData = new FormData();
    formData.append('screenshot', file);
    formData.append('appointment_id', uploadingForAppt.toString());

    try {
      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Payment uploaded successfully! Awaiting verification.');
      setUploadingForAppt(null);
      fetchAppointments();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message?.includes('UNIQUE constraint')) {
        alert('Payment is already uploaded and pending verification.');
      } else {
        alert('Failed to upload payment.');
      }
      setUploadingForAppt(null);
    }
  };

  const triggerUpload = (apptId: number) => {
    setUploadingForAppt(apptId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <MobileLayout title="MedCore Central">
      <div className="bg-[#0052FF] text-white p-6 pb-12 rounded-b-3xl relative">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h2>
            <p className="text-blue-100 text-sm">Manage your clinical day with precision. Access patient records, schedule appointments, and coordinate care.</p>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-xs font-semibold text-blue-200 mt-2 mr-2">QUICK FILTERS:</span>
          <button className="whitespace-nowrap px-4 py-1.5 rounded-full border border-blue-400 bg-blue-500/30 text-sm">Allopathic</button>
          <button className="whitespace-nowrap px-4 py-1.5 rounded-full border border-blue-400 bg-blue-500/30 text-sm">Homeopathic</button>
          <button className="whitespace-nowrap px-4 py-1.5 rounded-full border border-blue-400 bg-blue-500/30 text-sm">Herbal</button>
        </div>
      </div>

      <div className="px-4 -mt-6">
        
        {/* Upcoming Appointments */}
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-bold text-gray-900 text-lg">My Upcoming Appointments</h3>
          <button className="text-xs text-blue-600 font-medium">View Calendar</button>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

        <div className="space-y-3 mb-6">
          {appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').map(appt => (
            <div key={appt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center bg-blue-50 rounded-lg p-2 min-w-[3.5rem]">
                  <span className="text-lg font-bold text-blue-800">{new Date(appt.date).getDate() || '24'}</span>
                  <span className="text-xs font-medium text-blue-600 uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' }) || 'OCT'}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Dr. {appt.doctor_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{appt.specialization}</p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                      appt.status === 'Confirmed' ? 'bg-[#50E3C2] text-teal-900' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {appt.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startChat(appt.doctor_user_id, appt.doctor_name)} className="text-blue-600 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100">
                        <MessageSquare size={14}/>
                      </button>
                      <span className="text-xs font-medium text-gray-700">{appt.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {appt.status === 'Pending' && (
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <p className="text-[10px] text-gray-500">Awaiting payment verification</p>
                  <button onClick={() => triggerUpload(appt.id)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center hover:bg-blue-700">
                    <Upload size={12} className="mr-1" /> Upload Receipt
                  </button>
                </div>
              )}
            </div>
          ))}
          {appointments.length === 0 && <p className="text-sm text-gray-500 p-4 text-center bg-white rounded-xl shadow-sm border border-gray-100">No upcoming appointments.</p>}
        </div>

        {/* Recent History */}
        <h3 className="font-bold text-gray-900 text-lg mb-3">Recent History</h3>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-blue-50/50 px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-bold text-blue-800 tracking-wider">LATEST ACTIVITY</span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {history.slice(0, 3).map((item, idx) => (
               <div key={idx} className="p-4 flex gap-3">
                 <div className="mt-0.5">
                    {idx === 0 ? <AlertTriangle className="text-red-500" size={18}/> : 
                     idx === 1 ? <Mail className="text-blue-500" size={18}/> : 
                     <CheckCircle className="text-green-500" size={18}/>}
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-900">Consultation with Dr. {item.doctor_name}</p>
                   <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.record_text}</p>
                   <p className="text-[10px] text-gray-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                 </div>
               </div>
            ))}
            {history.length === 0 && <p className="p-4 text-sm text-gray-500 text-center">No recent activity.</p>}
          </div>
        </div>

      </div>

      {/* Chat Modal */}
      {messageDoctor && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col h-[70vh]">
             <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-blue-600 text-white rounded-t-2xl">
               <div className="flex items-center">
                 <MessageSquare size={18} className="mr-2"/> 
                 <h3 className="font-bold">Chat with Dr. {messageDoctor.name}</h3>
               </div>
               <button onClick={() => setMessageDoctor(null)} className="text-white/80 hover:text-white"><XCircle size={20}/></button>
             </div>
             <div className="p-4 flex-1 overflow-y-auto bg-gray-50 space-y-3">
               {messages.map((msg) => (
                 <div key={msg.id} className={`p-3 rounded-xl max-w-[85%] ${msg.sender_id === user?.id ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-200 text-gray-800'}`}>
                   <p className="text-sm">{msg.content}</p>
                   <p className="text-[10px] text-white/70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                 </div>
               ))}
               {messages.length === 0 && <p className="text-center text-xs text-gray-500 mt-4">No messages yet. Send a message to start the conversation.</p>}
             </div>
             <div className="p-3 bg-white border-t border-gray-100 rounded-b-2xl">
               <form onSubmit={sendMessage} className="flex gap-2">
                 <input
                   type="text"
                   className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
                   placeholder="Type a message..."
                   value={chatText}
                   onChange={(e) => setChatText(e.target.value)}
                 />
                 <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Send</button>
               </form>
             </div>
           </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default PatientHome;
