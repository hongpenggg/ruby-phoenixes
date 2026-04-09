import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { useAuthStore } from '../../store/authStore';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Database } from '../../types/supabase';

type EventRow = Database['public']['Tables']['events']['Row'];
type EventType = Database['public']['Tables']['events']['Insert']['type'];

interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  venue: string;
  type: EventType;
  max_players: string;
}

interface CreateEventDialogProps {
  event?: EventRow;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const INITIAL_FORM_DATA: EventFormData = {
  title: '',
  description: '',
  event_date: '',
  venue: '',
  type: 'training',
  max_players: '',
};

const toDateTimeLocalValue = (isoDate: string) => {
  const date = new Date(isoDate);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

const toFormData = (event?: EventRow): EventFormData => {
  if (!event) return INITIAL_FORM_DATA;
  return {
    title: event.title,
    description: event.description ?? '',
    event_date: toDateTimeLocalValue(event.event_date),
    venue: event.venue,
    type: event.type,
    max_players: event.max_players ? String(event.max_players) : '',
  };
};

export function CreateEventDialog({ event, open, onOpenChange }: CreateEventDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(event);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [formData, setFormData] = useState<EventFormData>(toFormData(event));

  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(toFormData(event));
    } else if (!isEditMode) {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [isOpen, isEditMode, event]);

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventPayload = {
        title: data.title,
        description: data.description || null,
        event_date: new Date(data.event_date).toISOString(),
        venue: data.venue,
        type: data.type,
        max_players: data.max_players ? parseInt(data.max_players, 10) : null,
      };

      const { error } = isEditMode
        ? await supabase.from('events').update(eventPayload).eq('id', event!.id)
        : await supabase.from('events').insert({
            ...eventPayload,
            created_by: user?.id,
          });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setDialogOpen(false);
      if (!isEditMode) {
        setFormData(INITIAL_FORM_DATA);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setDialogOpen}>
      {!isEditMode && (
        <Dialog.Trigger asChild>
          <Button>Create Event</Button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-neutral-200 bg-white p-6 text-neutral-900 shadow-xl">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {isEditMode ? 'Edit Event' : 'Create New Event'}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-neutral-600">
              {isEditMode ? 'Update event details.' : 'Schedule a new training session or match.'}
            </Dialog.Description>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                required 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <select 
                id="type"
                className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as EventType})}
              >
                <option value="training">Training</option>
                <option value="friendly">Friendly Match</option>
                <option value="competitive">Competitive Match</option>
                <option value="social">Social Event</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date & Time</Label>
                <Input 
                  id="date" 
                  type="datetime-local" 
                  required 
                  value={formData.event_date}
                  onChange={e => setFormData({...formData, event_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_players">Max Players (Optional)</Label>
                <Input 
                  id="max_players" 
                  type="number" 
                  min="1"
                  value={formData.max_players}
                  onChange={e => setFormData({...formData, max_players: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input 
                id="venue" 
                required 
                value={formData.venue}
                onChange={e => setFormData({...formData, venue: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea 
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
