import React from 'react';
import { GoogleIcon } from './icons';

interface LoginScreenProps {
  onLogin: () => void;
  error?: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors duration-300 p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 max-w-md w-full shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Productivity Dashboard</h1>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
              <p><strong>Login Error:</strong> {error}</p>
            </div>
          )}
          <button
            onClick={onLogin}
            className="w-full bg-black text-white dark:bg-white dark:text-black font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-3 hover:opacity-90"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
          <p className="text-sm text-neutral-500 text-center">
            Your productivity data will be synced across devices
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;