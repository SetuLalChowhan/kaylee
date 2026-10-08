import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setUser } from '@/redux/slices/authSlice';
import { useUpdateNotificationSettings } from '@/api/apiHooks/useNotification';

const Toggle = ({ label, description, checked, onChange, disabled }) => {
  return (
    <div className="flex items-center justify-between p-4 md:p-6 bg-white border border-gray-100/80 rounded-2xl md:rounded-3xl hover:border-gray-200 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="space-y-1 pr-4">
        <h4 className="text-sm md:text-base font-bold text-[#1A1A1A] tracking-tight">{label}</h4>
        <p className="text-xs md:text-sm text-gray-400 font-normal leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-[#0052FF]' : 'bg-gray-200'
        } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const NotificationSettings = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const updateSettingsMutation = useUpdateNotificationSettings();

  const handleToggle = (settingName, currentValue) => {
    const nextValue = !currentValue;
    // Optimistically update local redux store for immediate visual response
    dispatch(setUser({ [settingName]: nextValue }));

    // Send update to server
    updateSettingsMutation.mutate({
      [settingName]: nextValue,
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] p-6 md:p-10 shadow-sm">
      <div className="pb-6 border-b border-gray-100/70">
        <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Notification Preferences</h2>
      </div>
      
      <div className="pt-6 space-y-4">
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
