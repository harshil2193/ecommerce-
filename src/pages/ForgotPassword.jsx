import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import Toast from "../components/toast";

export default function ForgotPassword() {

  // STEPS: 1 = enter email, 2 = enter OTP, 3 = enter new password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // =====================
  // STEP 1: Send OTP
  // =====================
  const sendOtp = async () => {
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/forgot-password", { email });
      showToast("OTP sent to your email!", "success");
      setStep(2);
    } catch (err) {
      setErrors({ email: err.response?.data?.message || "Email not found" });
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // STEP 2: Verify OTP
  // =====================
  const verifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setErrors({ otp: "Please enter the 6-digit OTP" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/verify-reset-otp", { email, otp });
      showToast("OTP verified!", "success");
      setStep(3);
    } catch (err) {
      setErrors({ otp: err.response?.data?.message || "Invalid or expired OTP" });
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // STEP 3: Reset Password
  // =====================
  const resetPassword = async () => {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = "Password is required";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/reset-password", { email, otp, newPassword });
      showToast("Password reset successfully! Please login.", "success");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Failed to reset password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">E-Commerce</h1>
          <p className="text-gray-500 text-sm mt-1">Reset your password</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6 gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${step >= s
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-gray-400"}`}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div className={`h-1 w-8 rounded transition-all ${step > s ? "bg-indigo-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ===== STEP 1: EMAIL ===== */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-2">
              Enter your registered email and we'll send you an OTP.
            </p>

            <div>
              <label className="text-sm text-gray-600">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                placeholder="Enter your email"
                className={`w-full border rounded-lg p-3 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none text-base ${errors.email ? "border-red-400" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Sending...</>
              ) : "Send OTP"}
            </button>
          </div>
        )}

        {/* ===== STEP 2: OTP ===== */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-2">
              Enter the 6-digit OTP sent to <span className="font-semibold text-indigo-600">{email}</span>
            </p>

            <div>
              <label className="text-sm text-gray-600">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/, "")); setErrors({}); }}
                placeholder="6-digit OTP"
                className={`w-full border rounded-lg p-3 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-[0.5em] font-bold text-lg ${errors.otp ? "border-red-400" : ""}`}
              />
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Verifying...</>
              ) : "Verify OTP"}
            </button>

            <button
              onClick={() => { setStep(1); setOtp(""); setErrors({}); }}
              className="w-full text-sm text-indigo-600 hover:underline text-center"
            >
              ← Change email
            </button>

            <p className="text-center text-sm text-gray-500">
              Didn't receive OTP?{" "}
              <button onClick={sendOtp} className="text-indigo-600 hover:underline font-medium">
                Resend
              </button>
            </p>
          </div>
        )}

        {/* ===== STEP 3: NEW PASSWORD ===== */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-2">
              Set a new password for your account.
            </p>

            {/* New Password */}
            <div>
              <label className="text-sm text-gray-600">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors({ ...errors, newPassword: "", confirmPassword: "" }); }}
                  placeholder="Enter new password"
                  className={`w-full border rounded-lg p-3 mt-1 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-base ${errors.newPassword ? "border-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-700 hover:text-indigo-600 p-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-600">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: "" }); }}
                  placeholder="Re-enter new password"
                  className={`w-full border rounded-lg p-3 mt-1 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-base
                    ${confirmPassword && newPassword && confirmPassword === newPassword ? "border-green-400 focus:ring-green-400" : ""}
                    ${confirmPassword && newPassword && confirmPassword !== newPassword ? "border-red-400 focus:ring-red-400" : ""}
                    ${errors.confirmPassword ? "border-red-400" : ""}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-700 hover:text-indigo-600 p-1"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {confirmPassword && newPassword && confirmPassword === newPassword && (
                <p className="text-green-500 text-sm mt-1">✓ Passwords match</p>
              )}
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {errors.general && <p className="text-red-500 text-sm text-center">{errors.general}</p>}

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Resetting...</>
              ) : "Reset Password"}
            </button>
          </div>
        )}

        {/* Back to Login */}
        <p className="text-sm text-center mt-5 text-gray-600">
          Remember your password?{" "}
          <Link to="/" className="text-indigo-600 hover:underline font-medium">
            Login
          </Link>
        </p>

      </div>

      <Toast message={toast.message} show={toast.show} type={toast.type} />

    </div>
  );
}