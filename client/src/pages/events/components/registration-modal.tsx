import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMembers } from '@/api/members';
import { registerMemberToEvent } from '@/api/events';
import type { Member } from '@/schemas/member.schema';

interface RegistrationModalProps {
  eventId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationModal({ eventId, isOpen, onClose }: RegistrationModalProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers,
    enabled: isOpen, // Only fetch when modal is open
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!eventId || !selectedMemberId) return;
      await registerMemberToEvent(eventId, selectedMemberId);
    },
    onSuccess: () => {
      toast.success('Member registered successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      onClose();
      setSelectedMemberId('');
    },
    onError: (error: any) => {
      // Error is handled by global interceptor, but we can add specific handling here if needed
      console.error('Registration failed:', error);
    },
  });

  const handleRegister = () => {
    if (!selectedMemberId) {
      toast.error('Please select a member');
      return;
    }
    registerMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register Member</DialogTitle>
          <DialogDescription>
            Select a member to register for this event.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member" className="text-right">
              Member
            </Label>
            <div className="col-span-3">
              {isLoadingMembers ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading members...</span>
                </div>
              ) : (
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member: Member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRegister} disabled={registerMutation.isPending || !selectedMemberId}>
            {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
