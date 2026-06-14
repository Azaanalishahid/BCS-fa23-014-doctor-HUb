import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Search, Calendar, FileText, Upload, MessageSquare, Star, MapPin, DollarSign, LogOut } from 'lucide-react';
import MobileLayout from '../../components/Layout/MobileLayout';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'appointments' | 'history' | 'chat'>('search');

  // Filters
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('');

  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Messaging state
  const [chatDoctor, setChatDoctor] = useState<any>(null);
  const [chatText, setChatText] = useState('');

  // Payment upload state
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentApptId, setPaymentApptId] = useState<number | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
    fetchHistory();
  }, [diseaseFilter, treatmentFilter]);

  const fetchDoctors = async () => {
    try {
      let url = '/doctors?';
      if (diseaseFilter) url += `disease=${diseaseFilter}&`;
      if (treatmentFilter) url += `treatment_type=${treatmentFilter}`;
      const { data } = await api.get(url);
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const startChat = (doctor: any) => {
    setChatDoctor(doctor);
    setChatText('');
    fetchMessages(doctor.id);
    setActiveTab('chat');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatDoctor || !chatText.trim()) return;

    try {
      await api.post('/communication/message', {
        receiver_id: chatDoctor.id,
        content: chatText
      });
      setChatText('');
      fetchMessages(chatDoctor.id);
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments', {
        doctor_id: selectedDoctor.id,
        date,
        time
      });
      setSelectedDoctor(null);
      setDate('');
      setTime('');
      fetchAppointments();
      alert('Appointment booked successfully. Please upload payment.');
    } catch (err) {
      console.error(err);
      alert('Failed to book appointment.');
    }
  };

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFile || !paymentApptId) return;
    
    const formData = new FormData();
    formData.append('appointment_id', paymentApptId.toString());
    formData.append('screenshot', paymentFile);

    try {
      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPaymentFile(null);
      setPaymentApptId(null);
      alert('Payment uploaded successfully. Pending verification.');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert('Failed to upload payment.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'Pending': return 'badge-warning';
      case 'Confirmed': return 'badge-success';
      case 'Completed': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  const headerRight = (
    <button
      onClick={logout}
      className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-all"
    >
      <LogOut size={18} />
    </button>
  );

  return (
    <MobileLayout title={`Welcome, ${user?.name}`} headerRight={headerRight}>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {(['search', 'appointments', 'history', 'chat'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Doctors Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Filters */}
          <div className="card p-6">
            <h2 className="section-subtitle flex items-center gap-2">
              <Search size={20} />
              Find a Doctor
            </h2>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Search by specialization..." 
                className="input-field"
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value)}
              />
              <select 
                className="input-field"
                value={treatmentFilter}
                onChange={(e) => setTreatmentFilter(e.target.value)}
              >
                <option value="">All Treatment Types</option>
                <option value="Allopathic">Allopathic</option>
                <option value="Homeopathic">Homeopathic</option>
                <option value="Herbal">Herbal</option>
              </select>
            </div>
          </div>

          {/* Doctors List */}
          <div className="space-y-4">
            {doctors.length === 0 ? (
              <div className="card p-8 text-center">
                <Search size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No doctors found. Try different filters.</p>
              </div>
            ) : (
              doctors.map(doc => (
                <div key={doc.id} className="card-hover p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Dr. {doc.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{doc.specialization}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-500" />
                      <span>{doc.treatment_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-500" />
                      <span>₹{doc.fee} per consultation</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedDoctor(doc)}
                      className="flex-1 btn-primary py-2 text-sm"
                    >
                      Book Appointment
                    </button>
                    <button
                      onClick={() => startChat(doc)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-1 text-sm"
                    >
                      <MessageSquare size={16} />
                      Chat
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Book Appointment Form */}
          {selectedDoctor && (
            <div className="card p-6 border-2 border-blue-400">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold">Book with Dr. {selectedDoctor.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedDoctor.specialization}</p>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <input type="date" required className="input-field" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                  <input type="time" required className="input-field" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 btn-primary py-3">Confirm Booking</button>
                  <button type="button" onClick={() => setSelectedDoctor(null)} className="flex-1 btn-outline py-3">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <h2 className="section-title flex items-center gap-2">
            <Calendar size={24} />
            My Appointments
          </h2>
          
          {appointments.length === 0 ? (
            <div className="card p-8 text-center">
              <Calendar size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No appointments booked yet.</p>
            </div>
          ) : (
            appointments.map(appt => (
              <div key={appt.id} className="card-hover p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold">Dr. {appt.doctor_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Calendar size={16} />
                      {appt.date} at {appt.time}
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  {!appt.payment_verified && appt.status === 'Pending' && (
                    <button 
                      onClick={() => setPaymentApptId(appt.id)}
                      className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1"
                    >
                      <Upload size={16} />
                      Upload Payment
                    </button>
                  )}
                  {appt.payment_verified && (
                    <div className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-center text-sm font-medium">
                      ✓ Payment Verified
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Payment Upload Form */}
          {paymentApptId && (
            <div className="card p-6 border-2 border-yellow-400 bg-yellow-50">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">Upload Payment Screenshot</h3>
              <form onSubmit={handleUploadPayment} className="space-y-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  required
                  onChange={(e) => setPaymentFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-all font-medium">Upload</button>
                  <button type="button" onClick={() => setPaymentApptId(null)} className="flex-1 btn-outline py-3">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Medical History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="section-title flex items-center gap-2">
            <FileText size={24} />
            Medical History
          </h2>

          {history.length === 0 ? (
            <div className="card p-8 text-center">
              <FileText size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No medical history records found.</p>
            </div>
          ) : (
            history.map(item => (
              <div key={item.id} className="card p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">Dr. {item.doctor_name}</h3>
                  <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{item.record_text}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <h2 className="section-title flex items-center gap-2">
            <MessageSquare size={24} />
            Messages
          </h2>

          {!chatDoctor ? (
            <div className="card p-8 text-center">
              <MessageSquare size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Select a doctor from the search tab to start chatting.</p>
            </div>
          ) : (
            <div className="card p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="font-bold text-lg">Dr. {chatDoctor.name}</h3>
                <button
                  onClick={() => setChatDoctor(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 bg-gray-50 p-4 rounded-lg">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender_id === user?.id
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendMessage} className="space-y-3">
                <textarea
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Write your message..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                />
                <button type="submit" className="w-full btn-primary py-3">Send Message</button>
              </form>
            </div>
          )}
        </div>
      )}
    </MobileLayout>
  );
};

export default PatientDashboard;
