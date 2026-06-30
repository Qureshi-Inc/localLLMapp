'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Notification from '@/components/Notification';

interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleClearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email must be a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  }, [name, email, password, confirmPassword]);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const validationErrors = validate();
    setErrors(prev => {
      const filtered: Record<string, string> = {};
      for (const key of Object.keys(validationErrors)) {
        if (key === field || prev[key]) {
          filtered[key] = validationErrors[key];
        }
      }
      return filtered;
    });
  }, [validate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (res.ok) {
        setNotification({ message: 'Registration successful! Redirecting...', type: 'success' });
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const error = await res.json();
        if (res.status === 409) {
          setNotification({ message: 'Email already registered', type: 'error' });
        } else {
          setNotification({ message: error.error || 'Registration failed', type: 'error' });
        }
      }
    } catch {
      setNotification({ message: 'Registration failed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password, validate, router]);

  const hasErrors = Object.keys(errors).length > 0 && Object.keys(touched).length > 0;

  const nameError = touched.name ? errors.name : undefined;
  const emailError = touched.email ? errors.email : undefined;
  const passwordError = touched.password ? errors.password : undefined;
  const confirmPasswordError = touched.confirmPassword ? errors.confirmPassword : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>

        {notification && (
          <Notification message={notification.message} type={notification.type} onClose={handleClearNotification} />
        )}

        {hasErrors && (
          <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-medium">Please fix the errors below</p>
              {Object.values(errors).map((msg, i) => (
                <p key={i} className="ml-5 mt-0.5 text-xs opacity-80">{msg}</p>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <div className="space-y-4">
            <div className={`rounded-lg border px-4 py-3 ${nameError ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'}`}>
              <label htmlFor="register-name" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) setErrors(validate());
                }}
                onBlur={() => handleBlur('name')}
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm disabled:opacity-50"
                placeholder="Enter your name..."
                required
                disabled={isLoading}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? 'name-error' : undefined}
              />
              {nameError && (
                <p id="name-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {nameError}
                </p>
              )}
            </div>

            <div className={`rounded-lg border px-4 py-3 ${emailError ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'}`}>
              <label htmlFor="register-email" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) setErrors(validate());
                }}
                onBlur={() => handleBlur('email')}
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm disabled:opacity-50"
                placeholder="Enter your email..."
                required
                disabled={isLoading}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {emailError}
                </p>
              )}
            </div>

            <div className={`rounded-lg border px-4 py-3 ${passwordError ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'}`}>
              <label htmlFor="register-password" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) setErrors(validate());
                }}
                onBlur={() => handleBlur('password')}
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm disabled:opacity-50"
                placeholder="Enter your password..."
                required
                disabled={isLoading}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              {passwordError && (
                <p id="password-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {passwordError}
                </p>
              )}
            </div>

            <div className={`rounded-lg border px-4 py-3 ${confirmPasswordError ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'}`}>
              <label htmlFor="register-confirm-password" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirmPassword) setErrors(validate());
                }}
                onBlur={() => handleBlur('confirmPassword')}
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm disabled:opacity-50"
                placeholder="Confirm your password..."
                required
                disabled={isLoading}
                aria-invalid={!!confirmPasswordError}
                aria-describedby={confirmPasswordError ? 'confirm-password-error' : undefined}
              />
              {confirmPasswordError && (
                <p id="confirm-password-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {confirmPasswordError}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
