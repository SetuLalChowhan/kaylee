import React, { useState, useEffect } from 'react';
import { User, Crown, Bell, Shield } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PersonalSettings from './components/PersonalSettings';
import SubscriptionSettings from './components/SubscriptionSettings';
import NotificationSettings from './components/NotificationSettings';
import SecuritySettings from './components/SecuritySettings';

const Setting = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'Personal');

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const tabs = [
    { name: 'Personal', icon: User },
    { name: 'Subscription', icon: Crown },
    { name: 'Notification', icon: Bell },
    { name: 'Security', icon: Shield },
  ];

  return (
    <div className="py-4">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Settings</h1>
        <p className="text-gray-400 text-sm font-medium">Manage your account and subscription</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.name
              ? 'border-Primary text-Primary'
              : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.name ? 'text-Primary' : 'text-gray-400'}`} />
            <span className="text-sm font-bold">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="max-w-6xl">
        {activeTab === 'Personal' && <PersonalSettings />}
        {activeTab === 'Subscription' && <SubscriptionSettings />}
        {activeTab === 'Notification' && <NotificationSettings />}
        {activeTab === 'Security' && <SecuritySettings />}
      </div>
    </div>
  );
};

export default Setting;