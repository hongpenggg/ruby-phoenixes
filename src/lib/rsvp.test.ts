import { describe, expect, it } from 'vitest';
import { buildRsvpUpsert } from './rsvp';

describe('buildRsvpUpsert', () => {
  it('builds an upsert row for the player and event', () => {
    expect(buildRsvpUpsert('event-1', 'player-1', 'yes')).toEqual({
      row: { event_id: 'event-1', player_id: 'player-1', status: 'yes' },
      onConflict: 'event_id,player_id',
    });
  });

  it('keeps the unique(event_id, player_id) conflict target for every status', () => {
    for (const status of ['yes', 'no', 'maybe'] as const) {
      expect(buildRsvpUpsert('event-1', 'player-1', status).onConflict).toBe(
        'event_id,player_id',
      );
    }
  });
});
