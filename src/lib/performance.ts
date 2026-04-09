import { Database } from '../types/supabase';

type PerformanceRow = Database['public']['Tables']['performance_metrics']['Row'];

type AxisField = keyof Pick<
  PerformanceRow,
  | 'diving'
  | 'positioning'
  | 'penalties'
  | 'long_pass'
  | 'short_pass'
  | 'leadership'
  | 'dribbling'
  | 'heading'
  | 'interception'
  | 'progressive_pass'
  | 'safe_pass'
  | 'shooting'
  | 'defensive_actions'
>;

export type PlayerRoleGroup = 'goalkeeper' | 'defender' | 'midfielder' | 'attacker';

export interface PerformanceAxis {
  label: string;
  field: AxisField;
}

const AXES_BY_ROLE: Record<PlayerRoleGroup, PerformanceAxis[]> = {
  goalkeeper: [
    { label: 'Diving', field: 'diving' },
    { label: 'Positioning', field: 'positioning' },
    { label: 'Penalties', field: 'penalties' },
    { label: 'Long Pass', field: 'long_pass' },
    { label: 'Short Pass', field: 'short_pass' },
    { label: 'Leadership', field: 'leadership' },
  ],
  defender: [
    { label: 'Dribbling', field: 'dribbling' },
    { label: 'Heading', field: 'heading' },
    { label: 'Interception', field: 'interception' },
    { label: 'Progressive Pass', field: 'progressive_pass' },
    { label: 'Safe Pass', field: 'safe_pass' },
    { label: 'Leadership', field: 'leadership' },
  ],
  midfielder: [
    { label: 'Dribbling', field: 'dribbling' },
    { label: 'Interceptions', field: 'interception' },
    { label: 'Shooting', field: 'shooting' },
    { label: 'Long Pass', field: 'long_pass' },
    { label: 'Short Pass', field: 'short_pass' },
    { label: 'Leadership', field: 'leadership' },
  ],
  attacker: [
    { label: 'Dribbling', field: 'dribbling' },
    { label: 'Shooting', field: 'shooting' },
    { label: 'Defensive Actions', field: 'defensive_actions' },
    { label: 'Long Pass', field: 'long_pass' },
    { label: 'Short Pass', field: 'short_pass' },
    { label: 'Leadership', field: 'leadership' },
  ],
};

export function inferRoleGroup(position?: string | null): PlayerRoleGroup {
  const normalized = position?.trim().toLowerCase() ?? '';

  if (['goalkeeper', 'gk', 'keeper'].some((token) => normalized.includes(token))) {
    return 'goalkeeper';
  }

  if (
    ['defender', 'centre-back', 'center-back', 'fullback', 'left back', 'right back', 'cb', 'lb', 'rb'].some(
      (token) => normalized.includes(token),
    )
  ) {
    return 'defender';
  }

  if (
    ['midfielder', 'midfield', 'cm', 'dm', 'am', 'wingback', 'wing-back'].some((token) => normalized.includes(token))
  ) {
    return 'midfielder';
  }

  return 'attacker';
}

export function getAxesForPosition(position?: string | null): PerformanceAxis[] {
  return AXES_BY_ROLE[inferRoleGroup(position)];
}
