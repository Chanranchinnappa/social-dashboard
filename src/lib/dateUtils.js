// Helper to format dates for display
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const getWeekEnd = (date = new Date()) => {
  const start = getWeekStart(date);
  return new Date(start.setDate(start.getDate() + 6));
};

export const getWeekRangeString = (date = new Date()) => {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  return `${start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

export const isToday = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isWithinHours = (dateStr, hours) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = Math.abs(date - now);
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= hours;
};

export const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(new Date(current).toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};
