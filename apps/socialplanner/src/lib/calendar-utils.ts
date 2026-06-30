export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getCalendarGrid(year: number, month: number): (number | null)[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const grid: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    grid.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    grid.push(day);
  }

  while (grid.length % 7 !== 0) {
    grid.push(null);
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return weeks;
}

export function formatMonthYear(year: number, month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[month]} ${year}`;
}

export function isSameDay(date1: string, year: number, month: number, day: number): boolean {
  const d = new Date(date1);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}
