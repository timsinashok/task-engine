import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');
const TOKEN_FILE = join(DATA_DIR, 'token.json');
const EVENTS_FILE = join(DATA_DIR, 'events.json');

// Ensure data directory exists (will be created by server.js)

const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

// Color palette for events (same as frontend)
const colorPalette = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-rose-500',
];

// Function to get a consistent color for an event based on its ID
const getEventColor = (eventId) => {
  let hash = 0;
  for (let i = 0; i < eventId.length; i++) {
    hash = eventId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

// Store OAuth token
export const storeToken = (token) => {
  try {
    const tokenData = {
      token,
      storedAt: new Date().toISOString(),
    };
    writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    console.log('✅ Token stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

// Get stored token
export const getToken = () => {
  try {
    if (existsSync(TOKEN_FILE)) {
      const data = readFileSync(TOKEN_FILE, 'utf8');
      const tokenData = JSON.parse(data);
      return tokenData.token;
    }
    return null;
  } catch (error) {
    console.error('Error reading token:', error);
    return null;
  }
};

// Fetch calendar events from Google Calendar API
export const fetchCalendarEvents = async (accessToken) => {
  try {
    const today = new Date();
    const timeMin = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const timeMax = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      showDeleted: 'false',
      singleEvents: 'true',
      maxResults: '20',
      orderBy: 'startTime'
    });

    const response = await fetch(`${CALENDAR_API_URL}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear it
        if (existsSync(TOKEN_FILE)) {
          writeFileSync(TOKEN_FILE, JSON.stringify({ token: null, storedAt: null }, null, 2));
        }
        throw new Error('Token expired. Please re-authenticate.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to fetch calendar: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map API response to our CalendarEvent format
    const events = (data.items || []).map((item) => ({
      id: item.id,
      summary: item.summary || 'No Title',
      start: new Date(item.start.dateTime || item.start.date).toISOString(),
      end: new Date(item.end.dateTime || item.end.date).toISOString(),
      colorClass: getEventColor(item.id),
    }));

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

// Store calendar events to file
export const storeEvents = (events) => {
  try {
    const eventsData = {
      events,
      fetchedAt: new Date().toISOString(),
    };
    writeFileSync(EVENTS_FILE, JSON.stringify(eventsData, null, 2));
    console.log(`✅ Stored ${events.length} calendar events`);
    return true;
  } catch (error) {
    console.error('Error storing events:', error);
    return false;
  }
};

// Get stored calendar events
export const getStoredEvents = () => {
  try {
    if (existsSync(EVENTS_FILE)) {
      const data = readFileSync(EVENTS_FILE, 'utf8');
      const eventsData = JSON.parse(data);
      return eventsData.events || [];
    }
    return [];
  } catch (error) {
    console.error('Error reading stored events:', error);
    return [];
  }
};

// Get last fetch time
export const getLastFetchTime = () => {
  try {
    if (existsSync(EVENTS_FILE)) {
      const data = readFileSync(EVENTS_FILE, 'utf8');
      const eventsData = JSON.parse(data);
      return eventsData.fetchedAt || null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Refresh calendar events (fetch and store)
export const refreshCalendarEvents = async () => {
  const token = getToken();
  if (!token) {
    console.log('⚠️  No token available, skipping calendar refresh');
    return false;
  }

  try {
    console.log('🔄 Fetching calendar events from Google Calendar API...');
    const events = await fetchCalendarEvents(token);
    storeEvents(events);
    return true;
  } catch (error) {
    console.error('❌ Error refreshing calendar events:', error.message);
    return false;
  }
};

