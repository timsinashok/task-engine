
import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';

interface TimelineProps {
  events: CalendarEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const [currentTimePercentage, setCurrentTimePercentage] = useState(0);

  useEffect(() => {
    const updateIndicator = () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const totalMillisecondsInDay = 24 * 60 * 60 * 1000;
      const elapsedMilliseconds = now.getTime() - startOfDay.getTime();
      setCurrentTimePercentage((elapsedMilliseconds / totalMillisecondsInDay) * 100);
    };

    updateIndicator();
    const intervalId = setInterval(updateIndicator, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  const calculatePosition = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return ((hours * 60 + minutes) / (24 * 60)) * 100;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Today's Schedule</h2>
      <div className="relative h-16 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
        {events.map(event => {
          const left = calculatePosition(event.start);
          const width = calculatePosition(event.end) - left;
          return (
            <div
              key={event.id}
              className={`absolute top-0 h-full rounded-md flex items-center justify-center text-white text-xs font-semibold overflow-hidden whitespace-nowrap px-2 ${event.colorClass}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${event.summary} (${event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`}
            >
              <span className="truncate">{event.summary}</span>
            </div>
          );
        })}
        <div 
          className="absolute top-0 h-full w-0.5 bg-red-500 dark:bg-yellow-400 rounded-full z-10"
          style={{ left: `${currentTimePercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-500 mt-1 px-1">
        {[...Array(13)].map((_, i) => <span key={i}>{i * 2}</span>)}
      </div>
    </div>
  );
};

export default Timeline;
