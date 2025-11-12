import React, { useState, useEffect, useCallback } from 'react';
import { Item, QuickAccessLink, CalendarEvent } from '../types';
import Header from './Header';
import Timeline from './Timeline';
import QuickAccess from './QuickAccess';
import ItemList from './ItemList';
import * as localDB from '../services/localDB';
import { fetchGoogleCalendarEvents } from '../services/googleCalendar';
import { User } from 'firebase/auth';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Item[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<Item[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<Item[]>([]);
  const [quickAccessLinks, setQuickAccessLinks] = useState<QuickAccessLink[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const fetchCollection = useCallback(async (collectionName: string) => {
    try {
      const items = await localDB.getCollection(collectionName);
      switch (collectionName) {
        case 'tasks':
          setTasks(items);
          break;
        case 'weeklyGoals':
          setWeeklyGoals(items);
          break;
        case 'monthlyGoals':
          setMonthlyGoals(items);
          break;
        case 'quickAccess':
          setQuickAccessLinks(items);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
    }
  }, []); // setState functions are stable, no need for dependencies

  // Fetch local data on mount
  useEffect(() => {
    fetchCollection('tasks');
    fetchCollection('weeklyGoals');
    fetchCollection('monthlyGoals');
    fetchCollection('quickAccess');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch calendar events from server (with auto-refresh)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setCalendarError(null);
        console.log('Fetching calendar events from server...');
        
        // Import the server fetch function
        const { fetchCalendarEventsFromServer } = await import('../services/googleCalendar');
        
        const events = await fetchCalendarEventsFromServer();
        console.log('Calendar events fetched successfully:', events.length, 'events');
        setCalendarEvents(events);
      } catch (error: any) {
        console.error("Error fetching calendar events:", error);
        let errorMessage = error?.message || "Could not load schedule. Please sign out and sign in again.";
        
        // Provide more specific guidance
        if (errorMessage.includes('Calendar access denied') || errorMessage.includes('403') || errorMessage.includes('not been used')) {
          if (errorMessage.includes('not enabled') || errorMessage.includes('not been used')) {
            errorMessage = 'Google Calendar API is not enabled. Enable it at: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=perfect-productivity-d0272';
          } else {
            errorMessage = 'Calendar access denied. Please: 1) Enable Google Calendar API in Google Cloud Console, 2) Sign out and sign in again, 3) Grant calendar permissions when prompted';
          }
        }
        
        setCalendarError(errorMessage);
      }
    };

    // Fetch immediately on mount
    fetchEvents();

    // Set up periodic refresh every 5 minutes to get updates from server
    // (Server refreshes from Google Calendar API every hour)
    const intervalId = setInterval(() => {
      console.log('Refreshing calendar events from server...');
      fetchEvents();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Only run once on mount

  const handleAddItem = async (collectionName: string, text: string) => {
    if (!text.trim()) return;
    const newItem = { text, completed: false };
    await localDB.addDocument(collectionName, newItem);
    fetchCollection(collectionName);
  };

  const handleToggleItem = async (collectionName: string, id: number, completed: boolean) => {
    await localDB.updateDocument(collectionName, id, { completed: !completed });
    fetchCollection(collectionName);
  };

  const handleDeleteItem = async (collectionName: string, id: number) => {
    await localDB.deleteDocument(collectionName, id);
    fetchCollection(collectionName);
  };

  const handleAddLink = async (name: string, url: string) => {
    if(!name.trim() || !url.trim()) return;
    const newLink = { name, url };
    await localDB.addDocument('quickAccess', newLink);
    fetchCollection('quickAccess');
  };

  const handleDeleteLink = async (id: number) => {
    await localDB.deleteDocument('quickAccess', id);
    fetchCollection('quickAccess');
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl min-h-screen text-neutral-900 dark:text-neutral-100">
      <Header user={user} onLogout={onLogout} />
      
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 mb-8">
         {calendarError ? (
            <div className="text-center text-red-500 p-4">
                <p className="font-semibold">Could not load today's schedule</p>
                <p className="text-sm">{calendarError}</p>
            </div>
        ) : (
            <Timeline events={calendarEvents} />
        )}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 mb-8">
        <QuickAccess links={quickAccessLinks} onAddLink={handleAddLink} onDeleteLink={handleDeleteLink} />
      </div>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ItemList
          title="Monthly Goals"
          items={monthlyGoals}
          placeholder="Add a monthly goal..."
          onAddItem={(text) => handleAddItem('monthlyGoals', text)}
          onToggleItem={(id, completed) => handleToggleItem('monthlyGoals', id, completed)}
          onDeleteItem={(id) => handleDeleteItem('monthlyGoals', id)}
        />
        <div className="border-2 border-black dark:border-white rounded-xl">
          <ItemList
            title="Today's Tasks"
            items={tasks}
            placeholder="Add a new task..."
            onAddItem={(text) => handleAddItem('tasks', text)}
            onToggleItem={(id, completed) => handleToggleItem('tasks', id, completed)}
            onDeleteItem={(id) => handleDeleteItem('tasks', id)}
          />
        </div>
        <ItemList
          title="Weekly Goals"
          items={weeklyGoals}
          placeholder="Add a weekly goal..."
          onAddItem={(text) => handleAddItem('weeklyGoals', text)}
          onToggleItem={(id, completed) => handleToggleItem('weeklyGoals', id, completed)}
          onDeleteItem={(id) => handleDeleteItem('weeklyGoals', id)}
        />
      </main>
    </div>
  );
};

export default Dashboard;