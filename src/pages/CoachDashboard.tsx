import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Database } from '../types/supabase';
import { getAxesForPosition } from '../lib/performance';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PlayerRow = Database['public']['Tables']['players']['Row'];
type PerformanceInsert = Database['public']['Tables']['performance_metrics']['Insert'];

interface PlayerWithProfile extends ProfileRow {
  players: PlayerRow | null;
}

interface CommonPerformanceForm {
  match_rating: string;
  minutes_played: string;
  distance_ran_km: string;
  passes_completed: string;
  goals: string;
  assists: string;
  chances_created: string;
  event_id: string;
}

const INITIAL_COMMON_FORM: CommonPerformanceForm = {
  match_rating: '',
  minutes_played: '',
  distance_ran_km: '',
  passes_completed: '',
  goals: '',
  assists: '',
  chances_created: '',
  event_id: '',
};

export default function CoachDashboard() {
  const { user, profile } = useAuthStore();
  const queryClient = useQueryClient();

  const isCoachOrAdmin = profile?.role === 'coach' || profile?.role === 'admin';

  const { data: players, isLoading } = useQuery({
    queryKey: ['coach-players'],
    enabled: isCoachOrAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, players(*)')
        .in('role', ['player', 'assistant_coach'])
        .order('full_name', { ascending: true });

      if (error) throw error;
      return (data ?? []) as PlayerWithProfile[];
    },
  });

  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [strengthsInput, setStrengthsInput] = useState('');
  const [weaknessesInput, setWeaknessesInput] = useState('');
  const [commonForm, setCommonForm] = useState<CommonPerformanceForm>(INITIAL_COMMON_FORM);
  const [axisRatings, setAxisRatings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (players?.length && !selectedPlayerId) {
      setSelectedPlayerId(players[0].id);
    }
  }, [players, selectedPlayerId]);

  const selectedPlayer = useMemo(() => players?.find((player) => player.id === selectedPlayerId) ?? null, [players, selectedPlayerId]);
  const selectedPlayerInfo = selectedPlayer?.players ?? null;
  const axes = useMemo(() => getAxesForPosition(selectedPlayerInfo?.position), [selectedPlayerInfo?.position]);

  useEffect(() => {
    if (!selectedPlayerInfo) return;

    setStrengthsInput(selectedPlayerInfo.strengths?.join(', ') ?? '');
    setWeaknessesInput(selectedPlayerInfo.weaknesses?.join(', ') ?? '');
    setAxisRatings(
      axes.reduce<Record<string, string>>((acc, axis) => {
        acc[axis.field] = '';
        return acc;
      }, {}),
    );
    setCommonForm(INITIAL_COMMON_FORM);
  }, [selectedPlayerInfo, axes]);

  const updateTraitsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlayerId) throw new Error('Select a player first.');

      const strengths = strengthsInput
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const weaknesses = weaknessesInput
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from('players')
        .update({
          strengths: strengths.length ? strengths : null,
          weaknesses: weaknesses.length ? weaknesses : null,
        })
        .eq('id', selectedPlayerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-players'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['profile', selectedPlayerId] });
    },
  });

  const addPerformanceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlayerId || !user?.id) throw new Error('Select a player first.');

      const payload: PerformanceInsert = {
        player_id: selectedPlayerId,
        recorded_by: user.id,
        event_id: commonForm.event_id || null,
        match_rating: commonForm.match_rating ? Number(commonForm.match_rating) : null,
        minutes_played: commonForm.minutes_played ? Number(commonForm.minutes_played) : null,
        distance_ran_km: commonForm.distance_ran_km ? Number(commonForm.distance_ran_km) : null,
        passes_completed: commonForm.passes_completed ? Number(commonForm.passes_completed) : null,
        goals: commonForm.goals ? Number(commonForm.goals) : null,
        assists: commonForm.assists ? Number(commonForm.assists) : null,
        chances_created: commonForm.chances_created ? Number(commonForm.chances_created) : null,
      };

      axes.forEach((axis) => {
        payload[axis.field] = axisRatings[axis.field] ? Number(axisRatings[axis.field]) : null;
      });

      const { error } = await supabase.from('performance_metrics').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', selectedPlayerId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', selectedPlayerId] });
      queryClient.invalidateQueries({ queryKey: ['profile', selectedPlayerId] });
      setCommonForm(INITIAL_COMMON_FORM);
      setAxisRatings((prev) =>
        Object.keys(prev).reduce<Record<string, string>>((acc, key) => {
          acc[key] = '';
          return acc;
        }, {}),
      );
    },
  });

  if (!isCoachOrAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Coach Tools</h1>
        <p className="text-muted-foreground">Update player profiles and performance history. Changes are pushed to Supabase immediately.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Player</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading players...</p>
          ) : players?.length ? (
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[260px]"
              value={selectedPlayerId}
              onChange={(event) => setSelectedPlayerId(event.target.value)}
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.full_name || player.email} {player.players?.position ? `• ${player.players.position}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-muted-foreground">No player accounts found.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Player Strengths & Weaknesses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strengths">Strengths (comma separated)</Label>
              <Input
                id="strengths"
                value={strengthsInput}
                onChange={(event) => setStrengthsInput(event.target.value)}
                placeholder="e.g. Composure, Tackling, Stamina"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weaknesses">Weaknesses (comma separated)</Label>
              <Input
                id="weaknesses"
                value={weaknessesInput}
                onChange={(event) => setWeaknessesInput(event.target.value)}
                placeholder="e.g. Positioning, First Touch"
              />
            </div>
            <Button onClick={() => updateTraitsMutation.mutate()} disabled={updateTraitsMutation.isPending || !selectedPlayerId}>
              {updateTraitsMutation.isPending ? 'Updating...' : 'Update Player Traits'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Performance Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="match_rating">Match Rating (0-10)</Label>
                <Input id="match_rating" type="number" min="0" max="10" step="0.1" value={commonForm.match_rating} onChange={(event) => setCommonForm((prev) => ({ ...prev, match_rating: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="minutes_played">Minutes Played</Label>
                <Input id="minutes_played" type="number" min="0" max="120" value={commonForm.minutes_played} onChange={(event) => setCommonForm((prev) => ({ ...prev, minutes_played: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="distance_ran_km">Distance Ran (km)</Label>
                <Input id="distance_ran_km" type="number" min="0" max="50" step="0.1" value={commonForm.distance_ran_km} onChange={(event) => setCommonForm((prev) => ({ ...prev, distance_ran_km: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="passes_completed">Passes</Label>
                <Input id="passes_completed" type="number" min="0" value={commonForm.passes_completed} onChange={(event) => setCommonForm((prev) => ({ ...prev, passes_completed: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="goals">Goals</Label>
                <Input id="goals" type="number" min="0" value={commonForm.goals} onChange={(event) => setCommonForm((prev) => ({ ...prev, goals: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="assists">Assists</Label>
                <Input id="assists" type="number" min="0" value={commonForm.assists} onChange={(event) => setCommonForm((prev) => ({ ...prev, assists: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="chances_created">Chances Created</Label>
                <Input id="chances_created" type="number" min="0" value={commonForm.chances_created} onChange={(event) => setCommonForm((prev) => ({ ...prev, chances_created: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="event_id">Event ID (optional)</Label>
                <Input id="event_id" value={commonForm.event_id} onChange={(event) => setCommonForm((prev) => ({ ...prev, event_id: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-3 border rounded-md p-3">
              <p className="text-sm font-medium">Role-Based Hexagon Ratings (0-10)</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {axes.map((axis) => (
                  <div className="space-y-1" key={axis.field}>
                    <Label htmlFor={axis.field}>{axis.label}</Label>
                    <Input
                      id={axis.field}
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      value={axisRatings[axis.field] ?? ''}
                      onChange={(event) => setAxisRatings((prev) => ({ ...prev, [axis.field]: event.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => addPerformanceMutation.mutate()} disabled={addPerformanceMutation.isPending || !selectedPlayerId}>
              {addPerformanceMutation.isPending ? 'Updating...' : 'Update Performance'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
