import React, { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

const SecuritySettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] p-4 md:p-8">
      <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A] mb-4 md:mb-6">Security Settings</h2>
      
      <div className="border-t border-dashed border-gray-100 pt-4 md:pt-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-3.5 md:p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-[#1A1A1A] mb-1">Password</h4>
            <p className="text-xs text-gray-400 font-medium">Last changed 45 days ago</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-Primary text-white px-5 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl text-xs font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/10 w-full sm:w-auto text-center"
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
