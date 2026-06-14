import React, { useState, useEffect } from 'react';
import MobileLayout from '../../components/Layout/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Calendar, PenTool, CheckCircle, MessageSquare, MapPin, Activity, Clock } from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);

  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');

  const [clinicForm, setClinicForm] = useState({
    clinic_name: '',
    address: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchPrescriptions();
    fetchClinics();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/prescriptions');
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClinics = async () => {
    try {
      if (!user?.doctor_id) return;
      const { data } = await api.get(`/doctors/schedule/${user.doctor_id}`);
      setClinics(data.clinics || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      await api.post('/prescriptions', {
        appointment_id: selectedAppt.id,
        patient_id: selectedAppt.patient_id,
        medicines,
        notes
      });
      setSelectedAppt(null);
      setMedicines('');
      setNotes('');
      fetchAppointments();
      fetchPrescriptions();
      alert('Prescription added and saved to history!');
    } catch (err) {
      console.error(err);
      alert('Failed to add prescription.');
    }
  };

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/doctors/clinics', clinicForm);
      setClinicForm({ clinic_name: '', address: '', start_time: '', end_time: '' });
      fetchClinics();
      alert('Clinic schedule saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to save clinic schedule.');
    }
  };

  return (
    <MobileLayout title="MedCore Central" headerRight={<button onClick={logout} className="text-xs text-red-500 font-medium bg-red-50 px-3 py-1.5 rounded-full">Logout</button>}>
      
      <div className="bg-[#0052FF] text-white p-6 pb-12 rounded-b-3xl relative">
        <h2 className="text-2xl font-bold mb-1">Dr. {user?.name?.split(' ')[0]}</h2>
        <p className="text-blue-100 text-sm">Manage your schedule and clinics</p>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
           <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
             <p className="text-xs text-blue-100 mb-1">Today's Patients</p>
             <p className="text-2xl font-bold">{appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}</p>
           </div>
           <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
             <p className="text-xs text-blue-100 mb-1">Total Prescriptions</p>
             <p className="text-2xl font-bold">{prescriptions.length}</p>
           </div>
        </div>
      </div>

      <div className="px-4 -mt-6 pb-6">

        {/* Appointments Section */}
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-bold text-gray-900 text-lg">Today's Schedule</h3>
        </div>

        <div className="space-y-3 mb-8">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-1 h-full ${appt.status === 'Confirmed' ? 'bg-green-500' : appt.status === 'Completed' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <h4 className="font-bold text-gray-900">{appt.patient_name}</h4>
                   <p className="text-xs text-gray-500 flex items-center mt-1"><Clock size={12} className="mr-1"/> {appt.time}</p>
                 </div>
                 <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                    appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                    appt.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appt.status}
                  </span>
               </div>

               {appt.status !== 'Completed' && (
                 <button 
                   onClick={() => setSelectedAppt(appt)} 
                   className="w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium flex justify-center items-center hover:bg-blue-100 transition"
                 >
                   <PenTool size={16} className="mr-2"/> Add Prescription
                 </button>
               )}
            </div>
          ))}
          {appointments.length === 0 && <p className="text-sm text-gray-500 p-4 text-center bg-white rounded-xl shadow-sm border border-gray-100">No appointments scheduled.</p>}
        </div>

        {/* Write Prescription Modal Overlay inline */}
        {selectedAppt && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
               <h3 className="font-bold text-gray-900 text-lg mb-4">Prescription for {selectedAppt.patient_name}</h3>
               <form onSubmit={handlePrescribe} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Medicines</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      value={medicines}
                      onChange={(e) => setMedicines(e.target.value)}
                      placeholder="E.g., Paracetamol 500mg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notes (Optional)</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Dietary instructions..."
                    />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setSelectedAppt(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20">Save Record</button>
                  </div>
                  <p className="text-[10px] text-gray-500 text-center flex items-center justify-center mt-2">
                    <CheckCircle size={10} className="mr-1 text-green-500"/> Immutable once saved
                  </p>
               </form>
             </div>
          </div>
        )}

        {/* Manage Clinics Section */}
        <h3 className="font-bold text-gray-900 text-lg mb-3">Manage Clinics</h3>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
           <form onSubmit={handleClinicSubmit} className="space-y-3 mb-6 pb-6 border-b border-gray-100">
              <input
                type="text"
                required
                placeholder="Clinic Name"
                value={clinicForm.clinic_name}
                onChange={(e) => setClinicForm({ ...clinicForm, clinic_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="Address"
                value={clinicForm.address}
                onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  required
                  value={clinicForm.start_time}
                  onChange={(e) => setClinicForm({ ...clinicForm, start_time: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none text-gray-600"
                />
                <input
                  type="time"
                  required
                  value={clinicForm.end_time}
                  onChange={(e) => setClinicForm({ ...clinicForm, end_time: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none text-gray-600"
                />
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium">Add Clinic</button>
           </form>

           <div className="space-y-3">
             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">My Clinics</p>
             {clinics.map((clinic) => (
               <div key={clinic.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-blue-600" size={20}/>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{clinic.clinic_name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{clinic.address}</p>
                    <p className="text-[10px] text-blue-600 font-medium mt-1">{clinic.start_time} - {clinic.end_time}</p>
                  </div>
               </div>
             ))}
             {clinics.length === 0 && <p className="text-xs text-gray-500">No clinics added yet.</p>}
           </div>
        </div>

      </div>
    </MobileLayout>
  );
};

export default DoctorDashboard;

