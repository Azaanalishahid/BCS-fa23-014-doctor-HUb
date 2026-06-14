import React, { useState, useEffect } from 'react';
import MobileLayout from '../../components/Layout/MobileLayout';
import api from '../../lib/api';
import { Search, MapPin, Star, Calendar } from 'lucide-react';

const PatientSearch = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');
  const [treatmentMethod, setTreatmentMethod] = useState('In-Person');

  useEffect(() => {
    fetchDoctors();
  }, [specialty, treatmentMethod]);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/doctors');
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (docId: number) => {
    // In a real app, this would open a modal to select date/time.
    // For simplicity, we just book a fixed date/time or prompt.
    const date = window.prompt("Enter Date (YYYY-MM-DD)", new Date().toISOString().split('T')[0]);
    if(!date) return;
    const time = window.prompt("Enter Time (HH:MM AM/PM)", "10:00 AM");
    if(!time) return;

    try {
      await api.post('/appointments', { doctor_id: docId, date, time });
      alert('Appointment booked successfully!');
    } catch(err) {
      alert('Failed to book');
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Mocking specialization filter for the UI match
    if (specialty !== 'All Specialties' && doc.specialization !== specialty) return true; // keep simple for demo
    return true;
  });

  return (
    <MobileLayout title="MedCore Central">
      <div className="px-4 py-6">
        
        {/* Filters Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <button className="text-xs text-blue-600 font-medium">Clear all</button>
        </div>

        <div className="space-y-5 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider">Doctor Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by name..." 
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider">Specialization</label>
            <div className="space-y-2">
              {['All Specialties', 'Cardiologist', 'Dermatologist', 'General Physician', 'Pediatrician'].map(spec => (
                <label key={spec} className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="specialty" 
                    checked={specialty === spec}
                    onChange={() => setSpecialty(spec)}
                    className="text-blue-600 focus:ring-blue-500 rounded-sm"
                  />
                  <span className="text-sm text-gray-700">{spec}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider">Treatment Method</label>
            <div className="flex gap-2">
              {['In-Person', 'Teleconsult', 'Home Visit'].map(method => (
                <button 
                  key={method}
                  onClick={() => setTreatmentMethod(method)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-full ${
                    treatmentMethod === method ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Max Fee ($)</label>
            </div>
            <input type="range" min="50" max="500" className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$50</span>
              <span>$500+</span>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">{filteredDoctors.length}</span> Doctors available</p>
          <div className="text-xs text-gray-500 flex items-center">
            Sort by: <span className="text-blue-600 font-medium ml-1">Highest Rated</span>
          </div>
        </div>

        {/* Doctor List */}
        <div className="space-y-4">
          {filteredDoctors.map((doc, idx) => (
            <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden relative">
                     <img src={`https://ui-avatars.com/api/?name=${doc.name.replace(' ', '+')}&background=random`} alt={doc.name} className="w-full h-full object-cover"/>
                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#50E3C2] rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">Dr. {doc.name}</h3>
                    <p className="text-xs text-blue-600 font-medium">{doc.specialization || 'General Physician'}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">8+ Years Experience</p>
                  </div>
                </div>
                <div className="bg-green-50 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                  <Star size={10} className="mr-0.5 fill-current"/> 4.{8 - (idx%3)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 uppercase">Fee</p>
                  <p className="font-bold text-gray-900 text-sm">${doc.fee || '120'}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 uppercase">Type</p>
                  <p className="font-bold text-gray-900 text-sm">{idx % 2 === 0 ? 'In-Person' : 'Teleconsult'}</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md">Heart Surgery</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md">Consultation</span>
              </div>

              <button 
                onClick={() => handleBook(doc.id)}
                className="w-full bg-[#0052FF] text-white py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2 hover:bg-blue-700 transition"
              >
                <Calendar size={16}/> Book Appointment
              </button>
            </div>
          ))}

          {filteredDoctors.length === 0 && (
             <div className="text-center p-8 bg-blue-50 rounded-xl border border-blue-100 border-dashed">
                <h3 className="font-bold text-gray-900">Can't find a doctor?</h3>
                <p className="text-xs text-gray-500 mt-2 mb-4">Connect with our support team to find the right specialist.</p>
                <button className="text-blue-600 border border-blue-600 rounded-full px-6 py-1.5 text-xs font-medium hover:bg-blue-50">Get Assistance</button>
             </div>
          )}
        </div>

      </div>
    </MobileLayout>
  );
};

export default PatientSearch;
