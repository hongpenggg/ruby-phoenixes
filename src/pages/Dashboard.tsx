import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Activity, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { getAxesForPosition } from '../lib/performance';
import { Database } from '../types/supabase';

type EventRow = Database['public']['Tables']['events']['Row'];
type PerformanceRow = Database['public']['Tables']['performance_metrics']['Row'];
type PlayerRow = Database['public']['Tables']['players']['Row'];

export default function Dashboard() {
  const { user, profile } = useAuthStore();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const now = new Date().toISOString();
      const userId = user!.id;

      const [eventsResult, myRsvpsResult, performanceResult, playerResult] = await Promise.all([
        supabase.from('events').select('*').gte('event_date', now).order('event_date', { ascending: true }).limit(3),
        supabase
          .from('rsvps')
          .select('id, events!inner(event_date)')
          .eq('player_id', userId)
          .gte('events.event_date', now),
        supabase
          .from('performance_metrics')
          .select('*')
          .eq('player_id', userId)
          .order('recorded_at', { ascending: false })
          .limit(10),
        supabase.from('players').select('*').eq('id', userId).maybeSingle(),
      ]);

      if (eventsResult.error) throw eventsResult.error;
      if (myRsvpsResult.error) throw myRsvpsResult.error;
      if (performanceResult.error) throw performanceResult.error;
      if (playerResult.error) throw playerResult.error;

      return {
        upcomingEvents: (eventsResult.data ?? []) as EventRow[],
        myRsvpCount: myRsvpsResult.data?.length ?? 0,
        performanceRows: (performanceResult.data ?? []) as PerformanceRow[],
        player: (playerResult.data ?? null) as PlayerRow | null,
      };
    },
  });

  const latestPerformance = dashboardData?.performanceRows?.[0];
  const roleAxes = useMemo(() => getAxesForPosition(dashboardData?.player?.position), [dashboardData?.player?.position]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, {profile?.full_name || 'Player'}!</h1>
        <p className="text-muted-foreground mt-2 text-lg">Live updates from your team data on Supabase.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Event</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardData?.upcomingEvents?.[0] ? (
              <>
                <div className="text-base font-bold">{dashboardData.upcomingEvents[0].title}</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(dashboardData.upcomingEvents[0].event_date).toLocaleString()} • {dashboardData.upcomingEvents[0].venue}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events in the database yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Upcoming RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.myRsvpCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Based on upcoming events and your RSVP records.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Match Rating</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestPerformance?.match_rating !== null && latestPerformance?.match_rating !== undefined ? (
              <>
                <div className="text-2xl font-bold">{latestPerformance.match_rating}/10</div>
                <p className="text-xs text-muted-foreground">Recorded {new Date(latestPerformance.recorded_at).toLocaleDateString()}.</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No match ratings recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role Strength Snapshot</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestPerformance ? (
              <div className="space-y-1">
                {roleAxes.slice(0, 2).map((axis) => (
                  <p key={axis.field} className="text-xs text-muted-foreground">
                    {axis.label}: {latestPerformance[axis.field] ?? 'N/A'}/10
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No performance snapshot yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading events...</p>
            ) : dashboardData?.upcomingEvents.length ? (
              <div className="space-y-4">
                {dashboardData.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(event.event_date).toLocaleString()}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/events">View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events found.</p>
            )}
            <Button asChild variant="link" className="mt-4 px-0">
              <Link to="/events">View all events &rarr;</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>My Development</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.performanceRows.length ? (
              <div className="space-y-3">
                {roleAxes.map((axis) => (
                  <div key={axis.field}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{axis.label}</span>
                      <span className="text-sm font-medium">{latestPerformance?.[axis.field] ?? 'N/A'}/10</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-red-700 h-2 rounded-full"
                        style={{ width: `${Math.max(0, Math.min(10, latestPerformance?.[axis.field] ?? 0)) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No development data yet. Coaches can add your first performance entry.</p>
            )}
            <Button asChild variant="link" className="mt-6 px-0">
              <Link to={`/profile/${profile?.id}`}>View full profile &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
