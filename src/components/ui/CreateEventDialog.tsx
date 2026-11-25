import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { useAuthStore } from '../../store/authStore';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import {
  buildEventPayload,
  INITIAL_FORM_DATA,
  toFormData,
  type EventFormData,
  type EventRow,
  type EventType,
} from '../../lib/eventForm';

interface CreateEventDialogProps {
  event?: EventRow;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateEventDialog({ event, open, onOpenChange }: CreateEventDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isEditMode = Boolean(event);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [formData, setFormData] = useState<EventFormData>(toFormData(event));

  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    // In controlled mode, parent state is the source of truth.
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(toFormData(event));
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [isOpen, event]);

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      if (isEditMode && !event?.id) throw new Error('Missing event id for update.');
      if (!user?.id) throw new Error('You must be signed in to create an event.');

      const eventPayload = buildEventPayload(data);

      const { error } = isEditMode
        ? await supabase.from('events').update(eventPayload).eq('id', event!.id)
        : await supabase.from('events').insert({
            ...eventPayload,
            created_by: user.id,
          });

      if (error) throw error;
    },
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setDialogOpen(false);
      if (!isEditMode) {
        setFormData(INITIAL_FORM_DATA);
      }
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditMode
            ? 'Failed to update event.'
            : 'Failed to create event.',
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setErrorMessage('You must be signed in to create an event.');
      return;
    }
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
            {errorMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
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
              <Button type="submit" disabled={createMutation.isPending || !user?.id}>
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
