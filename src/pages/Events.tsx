import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar as CalendarIcon, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { CreateEventDialog } from '../components/ui/CreateEventDialog';
import { Database } from '../types/supabase';

type RSVP = Database['public']['Tables']['rsvps']['Row'];
type EventWithRsvps = Database['public']['Tables']['events']['Row'] & {
  rsvps: RSVP[];
};

export default function Events() {
  const { user, profile } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', filter],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*, rsvps(id, status, player_id)')
        .order('event_date', { ascending: filter !== 'past' });

      if (filter === 'upcoming') {
        query = query.gte('event_date', new Date().toISOString());
      } else if (filter === 'past') {
        query = query.lt('event_date', new Date().toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as EventWithRsvps[];
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'yes' | 'no' | 'maybe' }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('rsvps')
        .upsert(
          { event_id: eventId, player_id: user.id, status },
          { onConflict: 'event_id,player_id' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'Failed to update RSVP.');
    },
  });

  const isCoachOrAdmin = profile?.role === 'admin' || profile?.role === 'coach';

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events & Games</h1>
          <p className="text-muted-foreground">Join upcoming training sessions and matches.</p>
        </div>
        {isCoachOrAdmin && (
          <CreateEventDialog />
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <Button 
          variant={filter === 'upcoming' ? 'default' : 'outline'} 
          onClick={() => setFilter('upcoming')}
          size="sm"
        >
          Upcoming
        </Button>
        <Button 
          variant={filter === 'past' ? 'default' : 'outline'} 
          onClick={() => setFilter('past')}
          size="sm"
        >
          Past
        </Button>
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => setFilter('all')}
          size="sm"
        >
          All
        </Button>
      </div>

      {actionError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No events found.
          </div>
        ) : (
          events?.map((event) => {
            const myRsvp = event.rsvps?.find((r) => r.player_id === user?.id);
            const yesCount = event.rsvps?.filter((r) => r.status === 'yes').length || 0;

            return (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 capitalize">
                      {event.type}
                    </span>
                  </div>
                  <CardTitle className="mt-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(new Date(event.event_date), 'h:mm a')}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.venue}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {yesCount} {event.max_players ? `/ ${event.max_players}` : ''} attending
                  </div>
                </CardContent>
                <div className="p-6 pt-0 mt-auto border-t">
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Your RSVP:</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={myRsvp?.status === 'yes' ? 'default' : 'outline'}
                        className={myRsvp?.status === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'yes' })}
                        disabled={rsvpMutation.isPending}
                      >
                        Going
                      </Button>
                      <Button
                        size="sm"
                        variant={myRsvp?.status === 'maybe' ? 'default' : 'outline'}
                        className={myRsvp?.status === 'maybe' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                        onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'maybe' })}
                        disabled={rsvpMutation.isPending}
                      >
                        Maybe
                      </Button>
                      <Button
                        size="sm"
                        variant={myRsvp?.status === 'no' ? 'default' : 'outline'}
                        className={myRsvp?.status === 'no' ? 'bg-red-600 hover:bg-red-700' : ''}
                        onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'no' })}
                        disabled={rsvpMutation.isPending}
                      >
                        Not Going
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
