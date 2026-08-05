export function daysUntil(dateString: string): number {
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isPast(dateString: string): boolean {
  return new Date(dateString).getTime() < Date.now();
}
