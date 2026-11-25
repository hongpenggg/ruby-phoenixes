import { Database } from '../types/supabase';

export type RsvpStatus = Database['public']['Tables']['rsvps']['Row']['status'];

export interface RsvpUpsert {
  row: {
    event_id: string;
    player_id: string;
    status: RsvpStatus;
  };
  /** The unique constraint this upsert conflicts on. */
  onConflict: 'event_id,player_id';
}

/**
 * Build the RSVP upsert for one player on one event.
 *
 * This must stay an upsert on `unique(event_id, player_id)` (see
 * `supabase/migrations/20240101000000_initial_schema.sql`), not a
 * select-then-insert/update: the old two-step flow could race and create
 * a duplicate row when the same player RSVPs twice at once.
 */
export function buildRsvpUpsert(
  eventId: string,
  playerId: string,
  status: RsvpStatus,
): RsvpUpsert {
  return {
    row: { event_id: eventId, player_id: playerId, status },
    onConflict: 'event_id,player_id',
  };
}
