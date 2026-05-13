import React from 'react';
import { Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';

const PersonalSettings = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: 'Maya',
      lastName: 'Johnson',
      email: 'mayajohnson@gmail.com'
    }
  });

  const onSubmit = (data) => {
    console.log('Personal Info Saved:', data);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-10">
      <h2 className="text-xl font-bold text-[#1A1A1A] mb-8">Personal Information</h2>
      
      <div className="border-t border-dashed border-gray-100 pt-10 mb-10">
        <div className="relative w-32 h-32 rounded-full overflow-hidden group cursor-pointer mb-10">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" 
            alt="Profile" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white mb-1" />
            <span className="text-[10px] text-white font-bold">Update photo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-3">First Name</label>
              <input
                {...register('firstName')}
                type="text"
                placeholder="Enter your first name"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Last Name</label>
              <input
                {...register('lastName')}
                type="text"
                placeholder="Enter your last name"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button 
              type="button"
              className="px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-10 py-3.5 bg-Primary text-white rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalSettings;
