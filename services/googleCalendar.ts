import { CalendarEvent } from '../types';

const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const TOKEN_INFO_URL = 'https://www.googleapis.com/oauth2/v1/tokeninfo';
const SERVER_API_URL = '/api/calendar';

// Verify if the access token has the calendar scope
export const verifyTokenScope = async (accessToken: string): Promise<boolean> => {
    try {
        const response = await fetch(`${TOKEN_INFO_URL}?access_token=${accessToken}`);
        if (response.ok) {
            const data = await response.json();
            const scope = data.scope || '';
            const hasCalendarScope = scope.includes('calendar.events.readonly') || scope.includes('calendar');
            console.log('Token scopes:', scope);
            console.log('Has calendar scope:', hasCalendarScope);
            return hasCalendarScope;
        }
        return false;
    } catch (error) {
        console.error('Error verifying token scope:', error);
        return false;
    }
};

// Fetch calendar events from server (preferred method)
export const fetchCalendarEventsFromServer = async (): Promise<CalendarEvent[]> => {
    try {
        const response = await fetch(`${SERVER_API_URL}/events`);
        if (!response.ok) {
            throw new Error(`Failed to fetch calendar events from server: ${response.statusText}`);
        }
        const data = await response.json();
        // Convert ISO strings back to Date objects
        return data.events.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
        }));
    } catch (error) {
        console.error('Error fetching from server, falling back to direct API:', error);
        // Fallback to direct API if server fails
        const token = sessionStorage.getItem('google-access-token');
        if (token) {
            return fetchGoogleCalendarEvents(token);
        }
        throw error;
    }
};

// Store token on server
export const storeTokenOnServer = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${SERVER_API_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });
        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Error storing token on server:', error);
        return false;
    }
};

// Direct fetch from Google Calendar API (fallback)
export const fetchGoogleCalendarEvents = async (accessToken: string): Promise<CalendarEvent[]> => {
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
        let errorMessage = `Failed to fetch calendar events: ${response.statusText}`;
        
        // Try to get more detailed error information
        try {
            const errorData = await response.json();
            if (errorData.error) {
                errorMessage = errorData.error.message || errorMessage;
                console.error('Google Calendar API Error:', errorData.error);
            }
        } catch (e) {
            // If we can't parse the error, use the status text
        }
        
        // If token expired or invalid, the response status will be 401.
        if (response.status === 401) {
            // Clear the expired token from session storage
            sessionStorage.removeItem('google-access-token');
            errorMessage = 'Authentication failed. Please sign out and sign in again.';
        } else if (response.status === 403) {
            // Permission denied - likely Calendar API not enabled or scope not granted
            if (errorData?.error?.message?.includes('has not been used')) {
                errorMessage = 'Google Calendar API is not enabled. Please enable it in Google Cloud Console. See ENABLE_CALENDAR_API.md for instructions.';
            } else {
                errorMessage = 'Calendar access denied. Please ensure Google Calendar API is enabled and you granted calendar permissions.';
            }
        }
        
        throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Color palette for events (distinct colors)
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
    const getEventColor = (eventId: string): string => {
        // Hash the event ID to get a consistent index
        let hash = 0;
        for (let i = 0; i < eventId.length; i++) {
            hash = eventId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colorPalette.length;
        return colorPalette[index];
    };
    
    // Map API response to our CalendarEvent type
    const events = data.items?.map((item: any) => ({
        id: item.id,
        summary: item.summary || 'No Title',
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
        colorClass: getEventColor(item.id), 
    })) || [];

    return events;
};
