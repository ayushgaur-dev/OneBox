import { Item } from '../api';

export type ReminderUrgency = 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'FUTURE' | 'COMPLETED' | 'NONE';

export interface UrgencyInfo {
  urgency: ReminderUrgency;
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

/**
 * Determine the urgency level and formatted label for an item's deadline, reminder, or event.
 */
export function getUrgencyInfo(item: Item): UrgencyInfo {
  if (item.is_completed) {
    return {
      urgency: 'COMPLETED',
      label: 'Completed',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      borderColor: 'border-emerald-200',
    };
  }

  if (!item.remind_at) {
    if (item.category === 'DEADLINE') {
      return {
        urgency: 'NONE',
        label: 'Deadline (No date set)',
        badgeBg: 'bg-rose-50 border-rose-200',
        badgeText: 'text-rose-700',
        borderColor: 'border-rose-200',
      };
    }
    if (item.category === 'EVENT') {
      return {
        urgency: 'NONE',
        label: 'Event (No date set)',
        badgeBg: 'bg-purple-50 border-purple-200',
        badgeText: 'text-purple-700',
        borderColor: 'border-purple-200',
      };
    }
    if (item.category === 'REMINDER') {
      return {
        urgency: 'NONE',
        label: 'Reminder (No date set)',
        badgeBg: 'bg-amber-50 border-amber-200',
        badgeText: 'text-amber-700',
        borderColor: 'border-amber-200',
      };
    }
    return {
      urgency: 'NONE',
      label: 'No reminder',
      badgeBg: 'bg-slate-50 border-slate-200',
      badgeText: 'text-slate-600',
      borderColor: 'border-slate-200',
    };
  }

  const targetDate = new Date(item.remind_at);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Check if overdue
  if (diffMs < 0) {
    const overdueHours = Math.abs(diffHours);
    let timeStr = '';
    if (overdueHours < 1) {
      const mins = Math.max(1, Math.round(Math.abs(diffMs) / (1000 * 60)));
      timeStr = `${mins}m ago`;
    } else if (overdueHours < 24) {
      timeStr = `${Math.round(overdueHours)}h ago`;
    } else {
      const days = Math.round(overdueHours / 24);
      timeStr = `${days}d ago`;
    }

    return {
      urgency: 'OVERDUE',
      label: `Overdue (${timeStr})`,
      badgeBg: 'bg-red-50 border-red-300',
      badgeText: 'text-red-700 font-bold',
      borderColor: 'border-red-300',
    };
  }

  // Check if today
  const isSameDay =
    targetDate.getDate() === now.getDate() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getFullYear() === now.getFullYear();

  if (isSameDay) {
    const timeFormatted = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let relative = '';
    if (diffHours < 1) {
      const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
      relative = `in ${mins}m`;
    } else {
      relative = `in ${Math.round(diffHours)}h`;
    }

    return {
      urgency: 'TODAY',
      label: `Today at ${timeFormatted} (${relative})`,
      badgeBg: 'bg-amber-50 border-amber-300',
      badgeText: 'text-amber-800 font-semibold',
      borderColor: 'border-amber-300',
    };
  }

  // Check if upcoming (within 7 days)
  if (diffHours <= 24 * 7) {
    const dayName = targetDate.toLocaleDateString([], { weekday: 'short' });
    const timeFormatted = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      urgency: 'UPCOMING',
      label: `${dayName} at ${timeFormatted}`,
      badgeBg: 'bg-blue-50 border-blue-200',
      badgeText: 'text-blue-700 font-medium',
      borderColor: 'border-blue-200',
    };
  }

  // Future
  const dateFormatted = targetDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return {
    urgency: 'FUTURE',
    label: dateFormatted,
    badgeBg: 'bg-slate-100 border-slate-200',
    badgeText: 'text-slate-700',
    borderColor: 'border-slate-200',
  };
}

/**
 * Format ISO datetime for datetime-local input fields (YYYY-MM-DDTHH:mm)
 */
export function toInputDateTime(isoStr?: string | null): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

/**
 * Web Audio API gentle notification chime (runs entirely offline without external assets)
 */
export function playReminderChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio might be blocked if user hasn't interacted with page yet
  }
}

/**
 * Trigger desktop/browser notification if permission is granted
 */
export function triggerBrowserNotification(title: string, body: string): void {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/onebox_logo.png',
        });
      } catch {
        // Fallback or sandboxed frame handling
      }
    }
  }
}

/**
 * Generate and download an iCalendar (.ics) file for an event or deadline
 */
export function downloadIcsFile(item: Item): void {
  const startDate = item.remind_at ? new Date(item.remind_at) : new Date();
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration default

  const formatIcsDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OneBox//Smart Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:onebox-${item.id}-${Date.now()}@onebox.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${item.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${item.content.replace(/\n/g, '\\n')}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${item.title.replace(/\n/g, ' ')}`,
    'TRIGGER:-PT15M', // Alert 15 minutes prior
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeFilename = item.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30) || 'reminder';
  a.download = `${safeFilename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
