import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuthStore } from '../store/authStore';
import { Database } from '../types/supabase';
import { getAxesForPosition } from '../lib/performance';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type PlayerRow = Database['public']['Tables']['players']['Row'];
type PerformanceRow = Database['public']['Tables']['performance_metrics']['Row'];

interface ProfileData extends ProfileRow {
  players: PlayerRow[] | null;
}

const PAGE_SIZE = 10;

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user, profile: currentUserProfile, setProfile } = useAuthStore();
  const queryClient = useQueryClient();
  const [windowStart, setWindowStart] = useState(0);

  const isOwnProfile = user?.id === id;
  const isCoachOrAdmin = currentUserProfile?.role === 'admin' || currentUserProfile?.role === 'coach';

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*, players(*)').eq('id', id!).single();
      if (error) throw error;
      return data as ProfileData;
    },
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics', id],
    enabled: Boolean(id) && (isOwnProfile || isCoachOrAdmin),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('player_id', id!)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as PerformanceRow[];
    },
  });

  const playerInfo = profileData?.players?.[0] ?? null;
  const roleAxes = useMemo(() => getAxesForPosition(playerInfo?.position), [playerInfo?.position]);
  const latestMetric = metricsData?.[0];

  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
  });

  useEffect(() => {
    if (profileData) {
      setEditForm({
        full_name: profileData.full_name ?? '',
        bio: playerInfo?.bio ?? '',
      });
    }
  }, [profileData, playerInfo?.bio]);

  useEffect(() => {
    setWindowStart(0);
  }, [id]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!id || !isOwnProfile) return;

      const profileUpdate = supabase
        .from('profiles')
        .update({ full_name: editForm.full_name.trim() || null })
        .eq('id', id)
        .select('*')
        .single();

      const playerUpdate = supabase
        .from('players')
        .update({ bio: editForm.bio.trim() || null })
        .eq('id', id)
        .select('*')
        .single();

      const [profileResult, playerResult] = await Promise.all([profileUpdate, playerUpdate]);

      if (profileResult.error) throw profileResult.error;
      if (playerResult.error) throw playerResult.error;

      return {
        profile: profileResult.data,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['profile', id] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      if (result?.profile && isOwnProfile) {
        setProfile(result.profile as ProfileRow);
      }
    },
  });

  const windows = useMemo(() => {
    if (!metricsData?.length) return [];
    const values = [] as { start: number; label: string }[];
    for (let start = 0; start < metricsData.length; start += PAGE_SIZE) {
      const end = Math.min(start + PAGE_SIZE, metricsData.length);
      values.push({
        start,
        label: start === 0 ? `Most recent ${PAGE_SIZE}` : `Matches ${start + 1}-${end}`,
      });
    }
    return values;
  }, [metricsData]);

  const selectedWindow = useMemo(() => {
    if (!metricsData?.length) return [];
    return metricsData.slice(windowStart, windowStart + PAGE_SIZE).reverse();
  }, [metricsData, windowStart]);

  const ratingBarData = selectedWindow.map((metric) => ({
    date: new Date(metric.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    matchRating: metric.match_rating ?? 0,
  }));

  const radarData = roleAxes.map((axis) => ({
    skill: axis.label,
    value: latestMetric?.[axis.field] ?? 0,
  }));

  if (profileLoading) return <div>Loading profile...</div>;
  if (!profileData) return <div>Profile not found.</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center text-4xl font-bold text-red-800 overflow-hidden">
          {profileData.avatar_url ? (
            <img src={profileData.avatar_url} alt={profileData.full_name || ''} className="w-full h-full object-cover" />
          ) : (
            profileData.full_name?.charAt(0) || profileData.email.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">{profileData.full_name || 'Anonymous Player'}</h1>
          <p className="text-lg text-muted-foreground capitalize">{profileData.role}</p>

          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
            {playerInfo?.position && (
              <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm font-medium">Position: {playerInfo.position}</span>
            )}
            {playerInfo?.is_assistant_coach_candidate && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                Assistant Coach Candidate
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{playerInfo?.bio || 'No bio provided yet.'}</p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {playerInfo?.strengths?.length ? (
                      playerInfo.strengths.map((strength) => (
                        <span key={strength} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          {strength}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>

                {(isOwnProfile || isCoachOrAdmin) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Areas for Improvement</h4>
                    <div className="flex flex-wrap gap-2">
                      {playerInfo?.weaknesses?.length ? (
                        playerInfo.weaknesses.map((weakness) => (
                          <span key={weakness} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            {weakness}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not specified</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isOwnProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Edit My Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, full_name: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editForm.bio}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, bio: event.target.value }))}
                  />
                </div>
                <Button onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-8">
          {(isOwnProfile || isCoachOrAdmin) && (
            <Card>
              <CardHeader>
                <CardTitle>Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="h-[320px] flex items-center justify-center">Loading performance data...</div>
                ) : metricsData?.length ? (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-3">
                        <select
                          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                          value={windowStart}
                          onChange={(event) => setWindowStart(Number(event.target.value))}
                        >
                          {windows.map((window) => (
                            <option key={window.start} value={window.start}>
                              {window.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ratingBarData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Bar dataKey="matchRating" name="Match Rating" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-3">Role Strength Hexagon</p>
                      <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="skill" />
                            <PolarRadiusAxis domain={[0, 10]} />
                            <Radar name="Strength" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No performance data recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
