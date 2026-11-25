import { describe, expect, it } from 'vitest';
import {
  buildEventPayload,
  INITIAL_FORM_DATA,
  toDateTimeLocalValue,
  toFormData,
  type EventRow,
} from './eventForm';

const eventRow: EventRow = {
  id: 'event-1',
  title: 'Saturday Training',
  description: 'Passing drills',
  event_date: new Date(2026, 4, 17, 9, 30).toISOString(),
  venue: 'Serangoon Field',
  type: 'training',
  max_players: 20,
  created_by: 'coach-1',
  created_at: '2026-04-01T00:00:00.000Z',
  updated_at: '2026-04-01T00:00:00.000Z',
};

describe('toDateTimeLocalValue', () => {
  it('formats an ISO date as a local datetime-local value', () => {
    // Constructed in local time, so this holds in any timezone.
    const iso = new Date(2026, 4, 17, 9, 30).toISOString();
    expect(toDateTimeLocalValue(iso)).toBe('2026-05-17T09:30');
  });

  it('zero-pads month, day, hour and minute', () => {
    const iso = new Date(2026, 0, 5, 8, 5).toISOString();
    expect(toDateTimeLocalValue(iso)).toBe('2026-01-05T08:05');
  });
});

describe('toFormData', () => {
  it('returns a blank form when there is no event', () => {
    expect(toFormData()).toEqual(INITIAL_FORM_DATA);
  });

  it('returns a fresh object so callers cannot mutate the initial form', () => {
    const form = toFormData();
    form.title = 'changed';
    expect(INITIAL_FORM_DATA.title).toBe('');
  });

  it('maps an existing event into the form', () => {
    expect(toFormData(eventRow)).toEqual({
      title: 'Saturday Training',
      description: 'Passing drills',
      event_date: '2026-05-17T09:30',
      venue: 'Serangoon Field',
      type: 'training',
      max_players: '20',
    });
  });

  it('maps a null description and null max_players to empty strings', () => {
    expect(
      toFormData({ ...eventRow, description: null, max_players: null }),
    ).toMatchObject({ description: '', max_players: '' });
  });
});

describe('buildEventPayload', () => {
  it('builds a create/update payload from form data', () => {
    expect(
      buildEventPayload({
        title: 'Saturday Training',
        description: 'Passing drills',
        event_date: '2026-05-17T09:30',
        venue: 'Serangoon Field',
        type: 'friendly',
        max_players: '20',
      }),
    ).toEqual({
      title: 'Saturday Training',
      description: 'Passing drills',
      event_date: new Date('2026-05-17T09:30').toISOString(),
      venue: 'Serangoon Field',
      type: 'friendly',
      max_players: 20,
    });
  });

  it('turns an empty description into null and an empty cap into null', () => {
    const payload = buildEventPayload({
      ...INITIAL_FORM_DATA,
      title: 'Open Session',
      event_date: '2026-05-17T09:30',
      venue: 'Serangoon Field',
    });
    expect(payload.description).toBeNull();
    expect(payload.max_players).toBeNull();
  });
});
