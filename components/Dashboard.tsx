
import React, { useState, useEffect, useCallback } from 'react';
import { User, Item, QuickAccessLink, CalendarEvent } from '../types';
import Header from './Header';
import Timeline from './Timeline';
import QuickAccess from './QuickAccess';
import ItemList from './ItemList';
import * as firebase from '../services/firebase';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Item[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<Item[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<Item[]>([]);
  const [quickAccessLinks, setQuickAccessLinks] = useState<QuickAccessLink[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const fetchCollection = useCallback(async <T,>(collectionName: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try {
      const items = await firebase.getCollection<Omit<T, 'id'>>(user.uid, collectionName);
      setter(items as T[]);
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchCollection('tasks', setTasks);
    fetchCollection('weeklyGoals', setWeeklyGoals);
    fetchCollection('monthlyGoals', setMonthlyGoals);
    fetchCollection('quickAccess', setQuickAccessLinks);
    // Mock calendar events as Google Calendar API requires complex OAuth2 setup
    const today = new Date();
    setCalendarEvents([
        { id: '1', summary: 'Team Sync', start: new Date(today.setHours(9, 0, 0)), end: new Date(today.setHours(10, 0, 0)), colorClass: 'bg-blue-500' },
        { id: '2', summary: 'Review PR', start: new Date(today.setHours(11, 0, 0)), end: new Date(today.setHours(11, 30, 0)), colorClass: 'bg-green-500' },
        { id: '3', summary: 'Client Meeting', start: new Date(today.setHours(14, 0, 0)), end: new Date(today.setHours(15, 30, 0)), colorClass: 'bg-red-500' },
        { id: '4', summary: 'Design Mockups', start: new Date(today.setHours(16, 0, 0)), end: new Date(today.setHours(18, 0, 0)), colorClass: 'bg-yellow-400 text-black' },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCollection]);

  const handleAddItem = async (collectionName: string, text: string) => {
    if (!text.trim()) return;
    const newItem = { text, completed: false };
    const docRef = await firebase.addDocument(user.uid, collectionName, newItem);
    if(docRef) {
        fetchCollection(collectionName, (setters as any)[collectionName]);
    }
  };

  const handleToggleItem = async (collectionName: string, id: string, completed: boolean) => {
    await firebase.updateDocument(user.uid, collectionName, id, { completed: !completed });
    fetchCollection(collectionName, (setters as any)[collectionName]);
  };

  const handleDeleteItem = async (collectionName: string, id: string) => {
    await firebase.deleteDocument(user.uid, collectionName, id);
    fetchCollection(collectionName, (setters as any)[collectionName]);
  };

  const handleAddLink = async (name: string, url: string) => {
    if(!name.trim() || !url.trim()) return;
    const newLink = { name, url };
    await firebase.addDocument(user.uid, 'quickAccess', newLink);
    fetchCollection('quickAccess', setQuickAccessLinks);
  };

  const handleDeleteLink = async (id: string) => {
    await firebase.deleteDocument(user.uid, 'quickAccess', id);
    fetchCollection('quickAccess', setQuickAccessLinks);
  };

  const setters = {
    tasks: setTasks,
    weeklyGoals: setWeeklyGoals,
    monthlyGoals: setMonthlyGoals,
  };


  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl min-h-screen text-neutral-900 dark:text-neutral-100">
      <Header user={user} />
      
      <div className="card-bg rounded-xl p-4 mb-8">
        <Timeline events={calendarEvents} />
      </div>

      <div className="card-bg rounded-xl p-4 mb-8">
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
