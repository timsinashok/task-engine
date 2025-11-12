
export interface Item {
  id: number;
  text: string;
  completed: boolean;
  createdAt?: number;
}

export interface QuickAccessLink {
  id: number;
  name: string;
  url: string;
  createdAt?: number;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  colorClass: string;
}