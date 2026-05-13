import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AuthInput = ({ label, type = "text", placeholder, name, register, error, required = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-5">
      {label && (
        <label className="block text-[#1A1A1A] text-sm font-semibold mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          {...register(name, { required: required ? "This field is required" : false })}
          className={`w-full px-4 py-3.5 bg-white border ${error ? '!border-red-500 !focus:border-red-500' : 'border-[#E6E6E6] focus:border-Primary'
            } rounded-xl text-[#1A1A1A] text-sm focus:outline-none focus:ring-1 ${error ? '!ring-red-500/20' : 'focus:ring-Primary/20'
            } transition-all placeholder:text-gray-400`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
