import React, { useState, useEffect } from 'react';
import MobileLayout from '../../components/Layout/MobileLayout';
import api from '../../lib/api';
import { useLocation } from 'react-router-dom';

const DoctorHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  const location = useLocation();
  const state = location.state as { patient_id?: string };

  useEffect(() => {
    fetchPatients();
    if (state?.patient_id) {
      setSelectedPatientId(state.patient_id.toString());
      fetchHistory(state.patient_id.toString());
    }
  }, [state]);

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/appointments');
      const uniquePatients = Array.from(new Map(data.map((item: any) => [item.patient_id, item])).values());
      setPatients(uniquePatients);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async (patientId: string) => {
    if (!patientId) {
      setHistory([]);
      return;
    }
    try {
      const { data } = await api.get(`/history?patient_id=${patientId}`);
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedPatientId(pId);
    fetchHistory(pId);
  };

  return (
    <MobileLayout title="Medical Histories">
      <div className="bg-[#0052FF] text-white p-6 pb-12 rounded-b-3xl relative">
        <h2 className="text-2xl font-bold mb-1">Patient History</h2>
        <p className="text-blue-100 text-sm">View complete immutable medical records</p>
      </div>

      <div className="px-4 -mt-6 pb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider">Select Patient</label>
          <select 
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
            value={selectedPatientId}
            onChange={handlePatientChange}
          >
            <option value="">-- Choose a patient --</option>
            {patients.map(p => (
              <option key={p.patient_id} value={p.patient_id}>{p.patient_name}</option>
            ))}
          </select>
        </div>

        {selectedPatientId && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Medical Timeline</h3>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No medical history records found for this patient.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-4">
                {history.map((record) => (
                  <div key={record.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm bg-blue-500"></div>
                    <div>
                      <span className="text-xs font-bold text-gray-500 tracking-wider">
                        {new Date(record.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <div className="mt-2 bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-gray-900 text-sm">Dr. {record.doctor_name}</h4>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border border-gray-100">
                          {record.record_text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default DoctorHistory;
