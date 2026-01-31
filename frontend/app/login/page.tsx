'use client';

import { authApi } from '@/lib/api/auth';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    authApi.initiateGoogleLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-600 via-accent-600 to-primary-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10 animate-scale-in">
        <div className="glass-card rounded-3xl p-10 shadow-2xl backdrop-blur-xl bg-white/90">
          <div className="text-center">
            <div className="inline-block">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">
                SmartSplit
              </h1>
              <div className="h-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full" />
            </div>
            <p className="mt-4 text-gray-700 text-lg font-medium">
              Intelligent Expense & Settlement Management
            </p>
            <p className="mt-2 text-gray-500 text-sm">
              Split bills, track expenses, settle up easily
            </p>
          </div>

          <div className="mt-10">
            <button
              onClick={handleGoogleLogin}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-primary-300 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-accent-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <svg className="h-6 w-6 relative z-10" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="relative z-10">Sign in with Google</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">Securely log in with your Google account</p>
            </div>
            <p className="mt-3 text-sm text-gray-500">No passwords to remember!</p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass-card rounded-2xl p-4 backdrop-blur-xl bg-white/80">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-xs font-semibold text-gray-700">Lightning Fast</p>
          </div>
          <div className="glass-card rounded-2xl p-4 backdrop-blur-xl bg-white/80">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs font-semibold text-gray-700">Secure</p>
          </div>
          <div className="glass-card rounded-2xl p-4 backdrop-blur-xl bg-white/80">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-xs font-semibold text-gray-700">Smart Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
