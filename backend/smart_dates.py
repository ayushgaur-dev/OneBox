"""
Smart Date and Reminder Utilities for OneBox

Provides natural language date parsing, relative time resolution,
and reminder classification (overdue, today, upcoming).
"""

import re
from datetime import datetime, timezone, timedelta, time
from typing import Optional, Tuple


WEEKDAYS = {
    "monday": 0, "mon": 0,
    "tuesday": 1, "tue": 1,
    "wednesday": 2, "wed": 2,
    "thursday": 3, "thu": 3,
    "friday": 4, "fri": 4,
    "saturday": 5, "sat": 5,
    "sunday": 6, "sun": 6,
}

MONTHS = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}


def parse_time_component(text: str) -> Optional[Tuple[int, int]]:
    """Extract hour and minute from strings like '5pm', '5:30 pm', '17:00', '9am'."""
    match = re.search(r'\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b', text, re.IGNORECASE)
    if not match:
        return None

    hour = int(match.group(1))
    minute = int(match.group(2)) if match.group(2) else 0
    meridiem = match.group(3).lower() if match.group(3) else None

    if meridiem == 'pm' and hour < 12:
        hour += 12
    elif meridiem == 'am' and hour == 12:
        hour = 0

    if 0 <= hour <= 23 and 0 <= minute <= 59:
        return hour, minute
    return None


def parse_natural_date(text: str, base_time: Optional[datetime] = None) -> Optional[datetime]:
    """
    Parse natural language date/time references from text into a timezone-aware UTC datetime.
    Supports ISO formats, 'tomorrow at 5pm', 'in X hours', 'next friday', 'Nov 25 3pm', etc.
    """
    if not text or not text.strip():
        return None

    clean = text.strip()
    now = base_time or datetime.now(timezone.utc)

    # 1. Try ISO format first
    try:
        # Handles 2026-11-22T17:00:00, 2026-11-22T17:00:00Z, etc.
        iso_str = clean.replace('Z', '+00:00')
        dt = datetime.fromisoformat(iso_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        pass

    lower = clean.lower()

    # 2. 'in X hours / minutes / days'
    in_rel = re.search(r'\bin\s+(\d+)\s*(hour|hr|minute|min|day)s?\b', lower)
    if in_rel:
        num = int(in_rel.group(1))
        unit = in_rel.group(2)
        if 'min' in unit:
            return now + timedelta(minutes=num)
        elif 'hour' in unit or 'hr' in unit:
            return now + timedelta(hours=num)
        elif 'day' in unit:
            return now + timedelta(days=num)

    # 3. 'today' / 'tonight'
    if 'today' in lower or 'tonight' in lower:
        time_part = parse_time_component(lower)
        if 'tonight' in lower and not time_part:
            time_part = (20, 0) # default 8 PM
        elif not time_part:
            time_part = (18, 0) # default 6 PM
        target = now.replace(hour=time_part[0], minute=time_part[1], second=0, microsecond=0)
        return target

    # 4. 'tomorrow'
    if 'tomorrow' in lower:
        time_part = parse_time_component(lower) or (9, 0) # default 9 AM
        target = (now + timedelta(days=1)).replace(
            hour=time_part[0], minute=time_part[1], second=0, microsecond=0
        )
        return target

    # 5. Day of week (e.g. 'this Friday 5pm', 'next Monday', 'on Wednesday')
    for day_name, day_num in WEEKDAYS.items():
        pattern = rf'\b(?:next\s+|this\s+|on\s+)?{day_name}\b'
        if re.search(pattern, lower):
            days_ahead = (day_num - now.weekday()) % 7
            if days_ahead == 0 and 'next' in lower:
                days_ahead = 7
            elif days_ahead == 0:
                days_ahead = 7  # default to next occurrence
            time_part = parse_time_component(lower) or (9, 0)
            target = (now + timedelta(days=days_ahead)).replace(
                hour=time_part[0], minute=time_part[1], second=0, microsecond=0
            )
            return target

    # 6. Month + Day (e.g., 'Nov 25', 'December 15 at 10:30 AM', '15th March')
    for month_name, month_num in MONTHS.items():
        # Match 'Nov 25' or 'November 25, 2026' or '25 Nov'
        m_match = re.search(rf'\b{month_name}\s+(\d{{1,2}})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{{4}}))?\b', lower)
        if not m_match:
            m_match = re.search(rf'\b(\d{{1,2}})(?:st|nd|rd|th)?\s+{month_name}(?:\s*,?\s*(\d{{4}}))?\b', lower)

        if m_match:
            day = int(m_match.group(1))
            year = int(m_match.group(2)) if m_match.group(2) else now.year
            time_part = parse_time_component(lower) or (9, 0)
            try:
                target = datetime(year, month_num, day, time_part[0], time_part[1], tzinfo=timezone.utc)
                if target < now and not m_match.group(2):
                    # Next year
                    target = target.replace(year=year + 1)
                return target
            except ValueError:
                pass

    return None


def get_reminder_urgency(
    remind_at: Optional[datetime],
    is_completed: bool = False,
    now: Optional[datetime] = None
) -> str:
    """
    Classify reminder status into:
    - 'COMPLETED'
    - 'OVERDUE'
    - 'TODAY'
    - 'UPCOMING'
    - 'NONE'
    """
    if is_completed:
        return "COMPLETED"
    if not remind_at:
        return "NONE"

    curr = now or datetime.now(timezone.utc)
    if remind_at.tzinfo is None:
        remind_at = remind_at.replace(tzinfo=timezone.utc)

    if remind_at < curr:
        return "OVERDUE"

    # Compare calendar dates
    if remind_at.date() == curr.date():
        return "TODAY"

    if remind_at <= curr + timedelta(days=7):
        return "UPCOMING"

    return "FUTURE"
