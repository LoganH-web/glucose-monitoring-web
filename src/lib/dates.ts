export const APP_TIME_ZONE = "Asia/Kuala_Lumpur";

export function formatReadingDateTime(value: string | number | Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
}

export function formatReadingDate(value: string | number | Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
}
