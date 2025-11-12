import React, { useState, useEffect } from 'react';
import { CalendarIcon, MailIcon, LogoutIcon } from './icons';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = time.toLocaleDateString(undefined, dateOptions);
  const currentTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{currentDate}</h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400">{currentTime}</p>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors" aria-label="Google Calendar">
          <CalendarIcon />
        </a>
        <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors" aria-label="Gmail">
          <MailIcon />
        </a>
        <div className="flex items-center gap-3 pl-2 border-l border-neutral-200 dark:border-neutral-700">
            <img src={user.photoURL || undefined} alt={user.displayName || 'User'} className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors" aria-label="Logout">
                <LogoutIcon />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;