
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { signOutUser } from '../services/firebase';
import { CalendarIcon, MailIcon, LogoutIcon } from './icons';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
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
        <div className="flex items-center gap-2">
          <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
          <span className="text-sm font-medium hidden md:inline">{user.displayName}</span>
        </div>
        <button onClick={signOutUser} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors" aria-label="Logout">
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
