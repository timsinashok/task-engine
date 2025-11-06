import React, { useState, useEffect } from 'react';
import { onAuthChange, signInWithGoogle, isFirebaseConfigured } from './services/firebase';
import { User } from './types';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { SunIcon, MoonIcon } from './components/icons';

const FirebaseConfigWarning: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 p-4">
    <div className="bg-white border-2 border-red-200 rounded-xl p-8 max-w-2xl w-full shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Firebase Not Configured</h1>
        <p className="mb-4">
            It looks like you haven't set up your Firebase project configuration yet. This is required for authentication and data storage.
        </p>
        <p className="mb-6">
            Please open the <code className="bg-red-100 text-red-900 px-2 py-1 rounded-md text-sm font-mono">services/firebase.ts</code> file and replace the placeholder values with your actual Firebase project credentials.
        </p>
        <a 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition hover:bg-red-700"
        >
            Go to Firebase Console to get your credentials
        </a>
    </div>
  </div>
);

const App: React.FC = () => {
  if (!isFirebaseConfigured) {
    return <FirebaseConfigWarning />;
  }

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      if (error.code === 'auth/unauthorized-domain') {
        setLoginError(`This domain (${window.location.hostname}) is not authorized for authentication. Please add it to the authorized domains in your Firebase project's Authentication > Settings > Authorized domains.`);
      } else {
        setLoginError(error.message || 'An unknown error occurred during sign-in.');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  return (
    <>
      {user ? <Dashboard user={user} /> : <LoginScreen onLogin={handleLogin} error={loginError} />}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 bg-white dark:bg-neutral-800 p-3 rounded-full shadow-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </>
  );
};

export default App;