export function toIsoString(date?: unknown) {
  if (!date) return null;

  const newDate = String(date).split('/').reverse().join('-');
  
  const parsed = new Date(newDate);
  if (isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
}
