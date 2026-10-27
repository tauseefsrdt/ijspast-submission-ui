import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useAppDispatch } from '../../store';
import {
  forgotPasswordThunk,
  verifyOtpThunk,
  resendOtpThunk,
  resetPasswordThunk,
} from '../../store/slices/authSlice';
import { useToast } from '../../context/ToastContext';
import {
  forgotPasswordEmailSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '../../utils/validationSchemas';
import { FormInput } from '../../components/forms/common/FormInput';

type Step = 'email' | 'otp' | 'reset' | 'success';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>('email');

  // Multi-step session state
  const [savedEmail, setSavedEmail] = useState('');
  const [savedOtp, setSavedOtp] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Countdown timers
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(600);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Resend cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // OTP expiration timer effect
  useEffect(() => {
    if (currentStep !== 'otp' || otpExpiresIn <= 0) return;
    const interval = setInterval(() => {
      setOtpExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep, otpExpiresIn]);

  // Success auto-redirect effect
  useEffect(() => {
    if (currentStep !== 'success') return;
    if (redirectCountdown <= 0) {
      navigate('/login', { replace: true });
      return;
    }
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep, redirectCountdown, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Step 1 Formik Form ---
  const emailFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: forgotPasswordEmailSchema,
    onSubmit: async (values) => {
      const cleanEmail = values.email.trim();
      setError(null);
      setInfoMessage(null);
      setIsLoading(true);

      try {
        await dispatch(forgotPasswordThunk(cleanEmail)).unwrap();
        setSavedEmail(cleanEmail);
        setCurrentStep('otp');
        setResendCooldown(60);
        setOtpExpiresIn(600);
        const notice = `A 6-digit verification code has been dispatched to ${cleanEmail}`;
        setInfoMessage(notice);
        toast.success('Verification code dispatched to your email.');
      } catch (err: any) {
        const msg = err?.message || err || 'Failed to dispatch verification code. Please try again.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // --- Step 2 Formik Form ---
  const otpFormik = useFormik({
    initialValues: { otp: '' },
    validationSchema: verifyOtpSchema,
    onSubmit: async (values) => {
      if (otpExpiresIn <= 0) {
        const msg = 'OTP has expired. Please click "Resend Code" to receive a fresh OTP.';
        setError(msg);
        toast.error(msg);
        return;
      }

      setError(null);
      setInfoMessage(null);
      setIsLoading(true);

      try {
        const response: any = await dispatch(
          verifyOtpThunk({ email: savedEmail, otp: values.otp.trim() })
        ).unwrap();

        if (response?.resetToken) {
          setResetToken(response.resetToken);
        }
        setSavedOtp(values.otp.trim());
        setCurrentStep('reset');
        setInfoMessage('OTP verified successfully! Please enter your new password.');
        toast.success('OTP verified successfully.');
      } catch (err: any) {
        const msg = err?.message || err || 'Invalid or expired OTP. Please check the code or request a new one.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading || !savedEmail) return;

    setError(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      await dispatch(resendOtpThunk(savedEmail)).unwrap();
      setResendCooldown(60);
      setOtpExpiresIn(600);
      setInfoMessage(`A new 6-digit OTP code has been dispatched to ${savedEmail}`);
      toast.success('New OTP dispatched to your email.');
    } catch (err: any) {
      const msg = err?.message || err || 'Failed to resend OTP. Please wait before retrying.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3 Formik Form ---
  const resetFormik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      setError(null);
      setInfoMessage(null);
      setIsLoading(true);

      try {
        await dispatch(
          resetPasswordThunk({
            token: resetToken,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
            email: savedEmail,
            otp: savedOtp,
          })
        ).unwrap();

        setCurrentStep('success');
        setRedirectCountdown(3);
        toast.success('Password updated successfully! Redirecting to login.');
      } catch (err: any) {
        const msg = err?.message || err || 'Password reset failed. Your session may have expired.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Password validation checks for dynamic checklist UI
  const newPass = resetFormik.values.newPassword;
  const isLengthValid = newPass.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPass);
  const hasNumber = /[0-9]/.test(newPass);
  const passwordsMatch = newPass.length > 0 && newPass === resetFormik.values.confirmPassword;

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-150">
      {/* Title Card */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0d3b6e] text-amber-400 font-extrabold flex items-center justify-center text-lg mx-auto shadow-md">
          IJ
        </div>
        <h1 className="text-2xl font-extrabold text-[#0d3b6e] tracking-tight">
          Forgot Password
        </h1>
        <p className="text-xs text-slate-500">
          International Journal of Scientific Progress in Applied Science &amp; Technology
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
        {/* Step Indicator Progress Bar */}
        {currentStep !== 'success' && (
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span
                className={`flex items-center gap-1.5 ${
                  currentStep === 'email' ? 'text-[#0d3b6e] font-bold' : 'text-emerald-600'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 'email'
                      ? 'bg-[#0d3b6e] text-white'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {currentStep === 'email' ? '1' : '✓'}
                </span>
                <span>Email</span>
              </span>

              <div
                className={`h-0.5 flex-1 mx-2 transition-colors ${
                  currentStep === 'otp' || currentStep === 'reset'
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />

              <span
                className={`flex items-center gap-1.5 ${
                  currentStep === 'otp'
                    ? 'text-[#0d3b6e] font-bold'
                    : currentStep === 'reset'
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 'otp'
                      ? 'bg-[#0d3b6e] text-white'
                      : currentStep === 'reset'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep === 'reset' ? '✓' : '2'}
                </span>
                <span>Verify OTP</span>
              </span>

              <div
                className={`h-0.5 flex-1 mx-2 transition-colors ${
                  currentStep === 'reset' ? 'bg-[#0d3b6e]' : 'bg-slate-200'
                }`}
              />

              <span
                className={`flex items-center gap-1.5 ${
                  currentStep === 'reset' ? 'text-[#0d3b6e] font-bold' : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 'reset'
                      ? 'bg-[#0d3b6e] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  3
                </span>
                <span>Reset</span>
              </span>
            </div>
          </div>
        )}

        {/* Informational Message */}
        {infoMessage && currentStep !== 'success' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs font-medium animate-in fade-in">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Enter Registered Email */}
        {currentStep === 'email' && (
          <form onSubmit={emailFormik.handleSubmit} className="space-y-4 text-xs" noValidate>
            <div className="text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800 text-sm">
                Forgot your password?
              </p>
              <p className="text-[11px] leading-relaxed">
                Enter your registered institutional email address. We will send a secure 6-digit One-Time Password (OTP) to your inbox to authenticate your request.
              </p>
            </div>

            <FormInput
              label="Registered Institutional Email"
              required
              type="email"
              id="email"
              name="email"
              placeholder="name@university.edu"
              value={emailFormik.values.email}
              onChange={emailFormik.handleChange}
              onBlur={emailFormik.handleBlur}
              error={emailFormik.errors.email}
              touched={emailFormik.touched.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <button
              type="submit"
              disabled={isLoading || !emailFormik.values.email || !emailFormik.isValid}
              className="w-full py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Generating & Sending OTP...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <Link
                to="/login"
                className="text-xs text-slate-500 hover:text-[#0d3b6e] font-semibold inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Verify 6-digit OTP */}
        {currentStep === 'otp' && (
          <form onSubmit={otpFormik.handleSubmit} className="space-y-4 text-xs" noValidate>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800">
                  Verification Code Sent
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('email');
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="text-[11px] font-semibold text-[#0d3b6e] hover:underline cursor-pointer"
                >
                  Change Email
                </button>
              </div>
              <p className="text-slate-900 font-semibold break-all text-xs">
                {savedEmail}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  Enter 6-Digit OTP <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    otpExpiresIn < 60 ? 'text-rose-600' : 'text-slate-500'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Expires in: {formatTime(otpExpiresIn)}</span>
                </span>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  required
                  maxLength={6}
                  value={otpFormik.values.otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    otpFormik.setFieldValue('otp', val);
                  }}
                  onBlur={otpFormik.handleBlur}
                  placeholder="123456"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 tracking-[0.4em] font-mono text-center text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
                />
              </div>

              {otpFormik.touched.otp && otpFormik.errors.otp && (
                <p className="text-rose-600 text-[11px] font-medium mt-1">
                  {otpFormik.errors.otp}
                </p>
              )}

              {otpExpiresIn <= 0 && (
                <p className="text-rose-600 text-[11px] font-medium mt-1">
                  The OTP has expired. Please request a new code using the button below.
                </p>
              )}
            </div>

            {/* Resend OTP Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">Didn't receive the email?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="text-[11px] font-bold text-[#0d3b6e] hover:text-[#092b52] disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                otpFormik.values.otp.length !== 6 ||
                otpExpiresIn <= 0
              }
              className="w-full py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Verifying Code...' : 'Verify OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep('email');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-slate-500 hover:text-[#0d3b6e] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Email</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Enter New Password & Confirm Password */}
        {currentStep === 'reset' && (
          <form onSubmit={resetFormik.handleSubmit} className="space-y-4 text-xs" noValidate>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold block">Identity Verified</span>
                <span>You can now set a new password for {savedEmail}</span>
              </div>
            </div>

            {/* New Password */}
            <FormInput
              label="New Password"
              required
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              placeholder="Minimum 8 characters"
              value={resetFormik.values.newPassword}
              onChange={resetFormik.handleChange}
              onBlur={resetFormik.handleBlur}
              error={resetFormik.errors.newPassword}
              touched={resetFormik.touched.newPassword}
              leftIcon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Confirm New Password */}
            <FormInput
              label="Confirm New Password"
              required
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter your new password"
              value={resetFormik.values.confirmPassword}
              onChange={resetFormik.handleChange}
              onBlur={resetFormik.handleBlur}
              error={resetFormik.errors.confirmPassword}
              touched={resetFormik.touched.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Validation Check Indicators */}
            <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-[11px] border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                {isLengthValid ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={isLengthValid ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                  At least 8 characters long
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLetter && hasNumber ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={hasLetter && hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                  Contains letters and numbers
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {passwordsMatch ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={passwordsMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                  Passwords match
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !resetFormik.isValid || !resetFormik.values.newPassword}
              className="w-full py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Updating Secure Credentials...' : 'Save New Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 4: Success Message & Redirection */}
        {currentStep === 'success' && (
          <div className="text-center space-y-4 py-3 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-slate-900">
                Password Successfully Reset!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your account password has been updated securely. You can now use your new password to sign in.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
              <span>Automatically redirecting to login in </span>
              <span className="font-extrabold text-[#0d3b6e]">{redirectCountdown}</span>
              <span> seconds...</span>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>Proceed to Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
