import { Database } from '../types/supabase';

export type EventRow = Database['public']['Tables']['events']['Row'];
export type EventType = Database['public']['Tables']['events']['Insert']['type'];

export interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  venue: string;
  type: EventType;
  max_players: string;
}

export const INITIAL_FORM_DATA: EventFormData = {
  title: '',
  description: '',
  event_date: '',
  venue: '',
  type: 'training',
  max_players: '',
};

/** Format an ISO date as a `datetime-local` input value, in local time. */
export const toDateTimeLocalValue = (isoDate: string): string => {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toFormData = (event?: EventRow): EventFormData => {
  if (!event) return { ...INITIAL_FORM_DATA };
  return {
    title: event.title,
    description: event.description ?? '',
    event_date: toDateTimeLocalValue(event.event_date),
    venue: event.venue,
    type: event.type,
    max_players: event.max_players ? String(event.max_players) : '',
  };
};

export interface EventPayload {
  title: string;
  description: string | null;
  event_date: string;
  venue: string;
  type: EventType;
  max_players: number | null;
}

/**
 * Build the row payload for creating or updating an event.
 * `max_players` is parsed base-10; an empty value means no cap.
 */
export const buildEventPayload = (data: EventFormData): EventPayload => ({
  title: data.title,
  description: data.description || null,
  event_date: new Date(data.event_date).toISOString(),
  venue: data.venue,
  type: data.type,
  max_players: data.max_players ? parseInt(data.max_players, 10) : null,
});
