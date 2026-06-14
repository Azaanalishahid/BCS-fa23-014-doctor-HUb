import React, { useState, useEffect } from 'react';
import MobileLayout from '../../components/Layout/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Search, User, MessageSquare, History, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorSearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Chat State
  const [messagePatient, setMessagePatient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatText, setChatText] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/appointments');
      const uniquePatients = Array.from(new Map(data.map((item: any) => [item.patient_id, item])).values());
      setPatients(uniquePatients);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (patientUserId: number) => {
    try {
      const { data } = await api.get(`/communication/messages/${patientUserId}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const startChat = (patient: any) => {
    setMessagePatient(patient);
    setChatText('');
    fetchMessages(patient.patient_user_id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagePatient || !chatText.trim()) return;
    try {
      await api.post('/communication/message', {
        receiver_id: messagePatient.patient_user_id,
        content: chatText
      });
      setChatText('');
      fetchMessages(messagePatient.patient_user_id);
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  };

  const filteredPatients = patients.filter(p => 
    searchQuery === '' || p.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileLayout title="Patient Directory">
      <div className="bg-[#0052FF] text-white p-6 pb-12 rounded-b-3xl relative">
        <h2 className="text-2xl font-bold mb-1">My Patients</h2>
        <p className="text-blue-100 text-sm">Search and manage your patient records</p>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
          <input 
            type="text" 
            placeholder="Search by patient name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm focus:outline-none placeholder-white/50 text-white"
          />
        </div>
      </div>

      <div className="px-4 -mt-6 pb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">{filteredPatients.length}</span> Patients found</p>
        </div>

        <div className="space-y-4">
          {filteredPatients.map((patient: any) => (
            <div key={patient.patient_id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {patient.patient_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{patient.patient_name}</h4>
                  <p className="text-xs text-gray-500">Blood Group: {patient.blood_group}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate('/doctor/history', { state: { patient_id: patient.patient_id } })} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                  <History size={16} />
                </button>
                <button onClick={() => startChat(patient)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="text-center p-8 bg-blue-50 rounded-xl border border-blue-100 border-dashed mt-4">
               <h3 className="font-bold text-gray-900">No patients found</h3>
               <p className="text-xs text-gray-500 mt-2">Search with a different name or schedule an appointment first.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {messagePatient && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col h-[70vh]">
             <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-blue-600 text-white rounded-t-2xl">
               <div className="flex items-center">
                 <MessageSquare size={18} className="mr-2"/> 
                 <h3 className="font-bold">Chat with {messagePatient.patient_name}</h3>
               </div>
               <button onClick={() => setMessagePatient(null)} className="text-white/80 hover:text-white"><XCircle size={20}/></button>
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

export default DoctorSearch;
