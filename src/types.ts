export type ItemType = 'note' | 'event' | 'task';

export interface TimelineItem {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: number;
  type: ItemType;
  priority?: 'low' | 'medium' | 'high';
  isCompleted?: boolean;
}

export interface Note extends TimelineItem {
  type: 'note';
}

export interface ScheduledEvent extends TimelineItem {
  type: 'event';
  duration?: number; // in minutes
}

export interface Task extends TimelineItem {
  type: 'task';
  dueDate?: number;
}
