import { describe, expect, it } from 'vitest';
import { getAxesForPosition, inferRoleGroup } from './performance';

describe('inferRoleGroup', () => {
  it.each([
    ['Goalkeeper', 'goalkeeper'],
    ['GK', 'goalkeeper'],
    ['Centre-back', 'defender'],
    ['CB', 'defender'],
    ['Left Back', 'defender'],
    ['Central Midfielder', 'midfielder'],
    ['CM', 'midfielder'],
    ['Wing-back', 'midfielder'],
  ] as const)('maps %s to %s', (position, expected) => {
    expect(inferRoleGroup(position)).toBe(expected);
  });

  it('defaults unknown, empty and missing positions to attacker', () => {
    expect(inferRoleGroup('Striker')).toBe('attacker');
    expect(inferRoleGroup('')).toBe('attacker');
    expect(inferRoleGroup(undefined)).toBe('attacker');
    expect(inferRoleGroup(null)).toBe('attacker');
  });

  it('is case- and whitespace-insensitive', () => {
    expect(inferRoleGroup('  goalkeeper  ')).toBe('goalkeeper');
  });
});

describe('getAxesForPosition', () => {
  it('returns the six goalkeeper axes', () => {
    expect(getAxesForPosition('Goalkeeper').map((axis) => axis.label)).toEqual([
      'Diving',
      'Positioning',
      'Penalties',
      'Long Pass',
      'Short Pass',
      'Leadership',
    ]);
  });

  it('returns six axes for every role group', () => {
    for (const position of ['Goalkeeper', 'Defender', 'Midfielder', 'Striker']) {
      expect(getAxesForPosition(position)).toHaveLength(6);
    }
  });

  it('gives attackers a shooting axis and defenders an interception axis', () => {
    expect(
      getAxesForPosition('Striker').map((axis) => axis.field),
    ).toContain('shooting');
    expect(
      getAxesForPosition('Centre-back').map((axis) => axis.field),
    ).toContain('interception');
  });
});
