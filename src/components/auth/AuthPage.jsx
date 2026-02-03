import { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    orgName: '',
    taxNo: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

  const login = useAuthStore(state => state.login);
  const register = useAuthStore(state => state.register);

  const usernameRef = useRef(null);
  const orgNameRef = useRef(null);
  const taxNoRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      usernameRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [mode]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = 'Required';
    if (!formData.password) {
      newErrors.password = 'Required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Min 4 characters';
    }

    if (mode === 'register') {
      if (!formData.orgName.trim()) newErrors.orgName = 'Required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mode]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const result = await login({ username: formData.username, password: formData.password });
        if (!result.success) {
          setErrors({ submit: result.error || 'Login failed' });
        }
      } else {
        const result = await register({
          username: formData.username,
          password: formData.password,
          orgName: formData.orgName,
          taxNo: formData.taxNo
        });
        if (result.success) {
          // Auto login after registration
          const loginResult = await login({ username: formData.username, password: formData.password });
          if (!loginResult.success) {
            setErrors({ submit: 'Registered successfully. Please login.' });
            setMode('login');
          }
        } else {
          setErrors({ submit: result.error || 'Registration failed' });
        }
      }
    } catch {
      setErrors({ submit: 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef?.current ? nextRef.current.focus() : handleSubmit();
    }
  };

  const updateField = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const inputClass = (error) => `
    w-full h-10 px-3 text-sm bg-white border rounded-lg outline-none transition-all
    ${error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-yellow-50'
    }
  `;

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-[480px] bg-slate-800 text-white flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-lg font-semibold">ERP Suite</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Business Management<br />Made Simple
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Quotations, invoices, inventory, and customer management in one integrated platform.
          </p>

          <div className="mt-8 space-y-3">
            {['Quotation Management', 'Invoice Generation', 'Inventory Tracking', 'Customer Database'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-xs">© 2024 ERP Suite</p>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-800">ERP Suite</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                onClick={() => { setMode('login'); setErrors({}); }}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'login'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setErrors({}); }}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'register'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Username</label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={formData.username}
                  onChange={updateField('username')}
                  onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                  className={inputClass(errors.username)}
                  placeholder="Enter username"
                  autoFocus
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={updateField('password')}
                    onKeyDown={(e) => handleKeyDown(e, mode === 'register' ? confirmPasswordRef : null)}
                    className={inputClass(errors.password)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm Password</label>
                    <input
                      ref={confirmPasswordRef}
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={updateField('confirmPassword')}
                      onKeyDown={(e) => handleKeyDown(e, orgNameRef)}
                      className={inputClass(errors.confirmPassword)}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Organization Name</label>
                    <input
                      ref={orgNameRef}
                      type="text"
                      value={formData.orgName}
                      onChange={updateField('orgName')}
                      onKeyDown={(e) => handleKeyDown(e, taxNoRef)}
                      className={inputClass(errors.orgName)}
                      placeholder="Your Company Name"
                    />
                    {errors.orgName && <p className="text-red-500 text-xs mt-1">{errors.orgName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Tax No / GST (Optional)</label>
                    <input
                      ref={taxNoRef}
                      type="text"
                      value={formData.taxNo}
                      onChange={updateField('taxNo')}
                      onKeyDown={(e) => handleKeyDown(e, null)}
                      className={inputClass(errors.taxNo)}
                      placeholder="GST Number"
                    />
                    {errors.taxNo && <p className="text-red-500 text-xs mt-1">{errors.taxNo}</p>}
                  </div>
                </>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <button type="button" className="text-blue-600 hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {errors.submit && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
              className="text-blue-600 hover:underline"
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
