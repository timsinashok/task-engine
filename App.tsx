import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import { onAuthChange, signInWithGoogle, signOutUser } from './services/firebase';
import { SunIcon, MoonIcon } from './components/icons';
import { User, GoogleAuthProvider } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogin = async () => {
    try {
      setError(null);
      const result = await signInWithGoogle();
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        // Store the access token locally and on server
        sessionStorage.setItem('google-access-token', credential.accessToken);
        console.log('Access token stored locally');
        
        // Also store on server for hourly fetching
        const { storeTokenOnServer } = await import('./services/googleCalendar');
        await storeTokenOnServer(credential.accessToken);
      } else {
        console.warn('No access token in credential. Calendar access may not work.');
        console.log('Credential object:', credential);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || 'Failed to sign in. Please try again.');
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOutUser();
      sessionStorage.removeItem('google-access-token');
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-black">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {user ? <Dashboard user={user} onLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} error={error} />}
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