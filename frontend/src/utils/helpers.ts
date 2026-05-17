// ─── Utility Helpers ───────────────────────────────────────

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, differenceInHours } from 'date-fns';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Get user initials from name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Format a date string */
export function formatDate(date: string | null): string {
  if (!date) return 'No date';
  return format(new Date(date), 'MMM dd, yyyy');
}

/** Format relative time (e.g., "2 hours ago") */
export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Check if a task is overdue */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return isPast(new Date(dueDate));
}

/** Check if a task is due within 24 hours */
export function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const hours = differenceInHours(new Date(dueDate), new Date());
  return hours >= 0 && hours <= 24;
}

/** Priority display config */
export const priorityConfig = {
  CRITICAL: { label: 'Critical', class: 'priority-critical', color: '#ef4444' },
  HIGH: { label: 'High', class: 'priority-high', color: '#f97316' },
  MEDIUM: { label: 'Medium', class: 'priority-medium', color: '#eab308' },
  LOW: { label: 'Low', class: 'priority-low', color: '#22c55e' },
};

/** Status display config */
export const statusConfig = {
  TODO: { label: 'To Do', class: 'status-todo', color: '#64748b' },
  IN_PROGRESS: { label: 'In Progress', class: 'status-in-progress', color: '#3b82f6' },
  DONE: { label: 'Done', class: 'status-done', color: '#22c55e' },
};

/** Activity action labels */
export const activityLabels: Record<string, string> = {
  PROJECT_CREATED: 'created a project',
  PROJECT_UPDATED: 'updated a project',
  MEMBER_ADDED: 'added a member',
  MEMBER_REMOVED: 'removed a member',
  TASK_CREATED: 'created a task',
  TASK_UPDATED: 'updated a task',
  TASK_DELETED: 'deleted a task',
  TASK_STATUS_CHANGED: 'changed task status',
};
