export interface SchedulableContent {
  publishStatus?: 'published' | 'scheduled';
  scheduledAt?: string;
}

/**
 * Returns true if the content should be visible to public website visitors at `nowMs`.
 * Backward compatible: items without `publishStatus === 'scheduled'` are published immediately.
 */
export function isContentPublished(item: SchedulableContent, nowMs: number = Date.now()): boolean {
  if (item.publishStatus !== 'scheduled') return true;
  if (!item.scheduledAt) return true;
  const targetMs = new Date(item.scheduledAt).getTime();
  if (Number.isNaN(targetMs)) return true;
  return targetMs <= nowMs;
}

/**
 * Returns true if the item is currently waiting in the scheduled queue for a future timestamp.
 */
export function isContentPendingSchedule(item: SchedulableContent, nowMs: number = Date.now()): boolean {
  if (item.publishStatus !== 'scheduled' || !item.scheduledAt) return false;
  const targetMs = new Date(item.scheduledAt).getTime();
  if (Number.isNaN(targetMs)) return false;
  return targetMs > nowMs;
}

/**
 * Formats an ISO timestamp into a concise Indonesian date & time string.
 */
export function formatScheduleDateTime(isoStr?: string): string {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats an ISO timestamp into the standard publishedDate label (e.g. "15 Nov 2026").
 */
export function formatPublishedDateFromIso(isoStr?: string): string {
  const d = isoStr ? new Date(isoStr) : new Date();
  if (Number.isNaN(d.getTime())) {
    return new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Converts a Date or ISO string to a local `YYYY-MM-DDTHH:mm` value for `<input type="datetime-local">`.
 */
export function toDateTimeLocalValue(dateOrIso: Date | string): string {
  const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Returns a default local datetime string offset by `offsetHours` from now.
 */
export function getDefaultScheduleInputValue(offsetHours: number = 24): string {
  const target = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
  target.setSeconds(0, 0);
  return toDateTimeLocalValue(target);
}

/**
 * Returns a human-readable countdown label in Indonesian.
 */
export function getCountdownLabel(isoStr?: string, nowMs: number = Date.now()): string {
  if (!isoStr) return '-';
  const targetMs = new Date(isoStr).getTime();
  if (Number.isNaN(targetMs)) return '-';
  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) return 'Sudah Waktunya Tayang';

  const totalMinutes = Math.ceil(diffMs / 60_000);
  if (totalMinutes < 60) {
    return `${totalMinutes} menit lagi`;
  }
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;
  if (totalHours < 24) {
    return remMinutes > 0 ? `${totalHours} jam ${remMinutes} mnt lagi` : `${totalHours} jam lagi`;
  }
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  return remHours > 0 ? `${days} hari ${remHours} jam lagi` : `${days} hari lagi`;
}
