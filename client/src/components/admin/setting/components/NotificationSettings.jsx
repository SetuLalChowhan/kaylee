import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { useUpdateNotificationSettings } from '@/api/apiHooks/useNotification';

const Toggle = ({ label, description, checked, onChange, disabled }) => {
  return (
    <div className="flex items-center justify-between p-6 bg-white/50 border border-gray-50 rounded-2xl hover:bg-white hover:border-gray-100 transition-all shadow-sm">
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-[#1A1A1A]">{label}</h4>
        <p className="text-xs text-gray-400 font-medium">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-Primary' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
};

const NotificationSettings = () => {
  const user = useSelector(selectCurrentUser);
  const updateSettingsMutation = useUpdateNotificationSettings();

  const handleToggle = (settingName, currentValue) => {
    updateSettingsMutation.mutate({
      [settingName]: !currentValue
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-10">
      <h2 className="text-xl font-bold text-[#1A1A1A] mb-8">Notification Preferences</h2>
      
      <div className="border-t border-dashed border-gray-100 pt-10 space-y-4">
        <Toggle 
          label="Deadline reminders" 
          description="Get notified 48h before a campaign deadline"
          checked={user?.notifyDeadlineReminders ?? true}
          onChange={() => handleToggle('notifyDeadlineReminders', user?.notifyDeadlineReminders ?? true)}
          disabled={updateSettingsMutation.isPending}
        />
        <Toggle 
          label="Invoice updates" 
          description="When a payment status changes"
          checked={user?.notifyInvoiceUpdates ?? true}
          onChange={() => handleToggle('notifyInvoiceUpdates', user?.notifyInvoiceUpdates ?? true)}
          disabled={updateSettingsMutation.isPending}
        />
        <Toggle 
          label="Content approvals" 
          description="When a brand approves or rejects content"
          checked={user?.notifyContentApprovals ?? false}
          onChange={() => handleToggle('notifyContentApprovals', user?.notifyContentApprovals ?? false)}
          disabled={updateSettingsMutation.isPending}
        />
        <Toggle 
          label="Task reminders" 
          description="Daily digest of upcoming tasks"
          checked={user?.notifyTaskReminders ?? false}
          onChange={() => handleToggle('notifyTaskReminders', user?.notifyTaskReminders ?? false)}
          disabled={updateSettingsMutation.isPending}
        />
      </div>
    </div>
  );
};

export default NotificationSettings;
