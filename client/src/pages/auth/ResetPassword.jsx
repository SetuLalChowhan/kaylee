import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthInput from '@/components/ui/AuthInput';
import CommonButton from '@/components/ui/CommonButton';
import { useResetPassword } from '@/api/apiHooks/useAuth';
import { PASSWORD_RULES, CONFIRM_PASSWORD_RULES } from '@/utils/validation';
import { useEffect } from 'react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const resetToken = location.state?.resetToken;

  const resetPasswordMutation = useResetPassword();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const newPassword = watch("newPassword");

  const onSubmit = (data) => {
    resetPasswordMutation.mutate({
      token,
      resetToken,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  const hasAccess = !!(token || resetToken);

  useEffect(() => {
    if (!hasAccess) {
      navigate('/forgot-password');
    }
  }, [hasAccess, navigate]);

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-[28px] lg:text-[32px] font-bold text-[#1A1A1A] mb-2">Create new password</h2>
        <p className="text-[#666] text-sm lg:text-base">Set a strong password to secure your account</p>
      </div>

      <form className="mb-6" onSubmit={handleSubmit(onSubmit)}>
        <AuthInput 
          label="New password"
          type="password"
          name="newPassword"
          placeholder="Enter new password"
          register={register}
          rules={PASSWORD_RULES}
          error={errors.newPassword}
          required
        />
        <AuthInput 
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your new password"
          register={register}
          rules={CONFIRM_PASSWORD_RULES(newPassword)}
          error={errors.confirmPassword}
          required
        />

        <div className="mt-10">
          <CommonButton 
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetPasswordMutation.isPending ? "Resetting..." : "Continue"}
          </CommonButton>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
