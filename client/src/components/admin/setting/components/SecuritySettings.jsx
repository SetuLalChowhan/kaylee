import React, { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

const SecuritySettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-10">
      <h2 className="text-xl font-bold text-[#1A1A1A] mb-8">Security Settings</h2>
      
      <div className="border-t border-dashed border-gray-100 pt-10">
        <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-[#1A1A1A] mb-1">Password</h4>
            <p className="text-xs text-gray-400 font-medium">Last changed 45 days ago</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-Primary text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/10"
          >
            Change Password
          </button>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default SecuritySettings;
