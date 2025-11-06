
import { User as FirebaseUser } from 'firebase/auth';

export type User = FirebaseUser;

export interface Item {
  id: string;
  text: string;
  completed: boolean;
}

export interface QuickAccessLink {
  id: string;
  name: string;
  url: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  colorClass: string;
}
