import React, { useState, useEffect } from 'react';
import MobileLayout from '../../components/Layout/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const PatientHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/history');
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getTimelineDotColor = (treatmentType: string) => {
    switch (treatmentType) {
      case 'Allopathic': return 'bg-blue-500';
      case 'Homeopathic': return 'bg-green-500';
      case 'Herbal': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <MobileLayout title="Patient History">
      <div className="bg-[#0052FF] text-white p-6 pb-12 rounded-b-3xl">
        <h2 className="text-2xl font-bold mb-2">Immutable Medical History</h2>
        <p className="text-blue-100 text-sm">Your complete, uneditable medical timeline across all our specialists.</p>
        
        <div className="mt-6 flex gap-3 text-xs">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Allopathic</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Homeopathic</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div>Herbal</div>
        </div>
      </div>

      <div className="px-6 py-6 -mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[60vh]">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No medical history records found.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-8">
              {history.map((record, index) => (
                <div key={record.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getTimelineDotColor(record.treatment_type)}`}></div>
                  
                  {/* Content Card */}
                  <div>
                    <span className="text-xs font-bold text-gray-500 tracking-wider">
                      {new Date(record.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="mt-2 bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-gray-900 text-sm">Dr. {record.doctor_name}</h4>
                         <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                           {record.specialization || record.treatment_type}
                         </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 whitespace-pre-wrap mt-3 bg-white p-3 rounded border border-gray-100">
                        {record.record_text}
                      </div>

                      <div className="mt-3 flex justify-between items-center border-t border-gray-200 pt-3">
                         <span className="text-[10px] text-gray-500 flex items-center">
                           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
                           Immutable Record
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default PatientHistory;
