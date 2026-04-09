import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user, profile: currentUserProfile } = useAuthStore();
  
  const isOwnProfile = user?.id === id;
  const isCoachOrAdmin = currentUserProfile?.role === 'admin' || currentUserProfile?.role === 'coach';

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, players(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as any;
    },
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('player_id', id)
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      
      // Format data for charts
      return (data as any[]).map(m => ({
        date: new Date(m.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        passing: m.passing_accuracy || 0,
        tackling: m.tackling_success || 0,
        endurance: (m.endurance || 0) * 10, // scale to 100 for chart
      }));
    },
    enabled: isOwnProfile || isCoachOrAdmin,
  });

  if (profileLoading) return <div>Loading profile...</div>;
  if (!profileData) return <div>Profile not found</div>;

  const playerInfo = profileData.players?.[0];

  return (
    <div className="space-y-8">
      {/* Header Section */}
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
              <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm font-medium">
                Position: {playerInfo.position}
              </span>
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
        {/* Left Column - Info */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {playerInfo?.bio || "No bio provided yet."}
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {playerInfo?.strengths?.map(s => (
                      <span key={s} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {s}
                      </span>
                    )) || <span className="text-sm text-gray-500">Not specified</span>}
                  </div>
                </div>
                
                {(isOwnProfile || isCoachOrAdmin) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Areas for Improvement</h4>
                    <div className="flex flex-wrap gap-2">
                      {playerInfo?.weaknesses?.map(w => (
                        <span key={w} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          {w}
                        </span>
                      )) || <span className="text-sm text-gray-500">Not specified</span>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metrics */}
        <div className="md:col-span-2 space-y-8">
          {(isOwnProfile || isCoachOrAdmin) && (
            <Card>
              <CardHeader>
                <CardTitle>Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="h-[300px] flex items-center justify-center">Loading chart...</div>
                ) : metricsData && metricsData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metricsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="passing" name="Passing %" stroke="#b91c1c" strokeWidth={2} />
                        <Line type="monotone" dataKey="tackling" name="Tackling %" stroke="#f59e0b" strokeWidth={2} />
                        <Line type="monotone" dataKey="endurance" name="Endurance" stroke="#0369a1" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
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
