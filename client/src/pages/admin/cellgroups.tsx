import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Edit, Plus } from 'lucide-react';
import api from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const cellGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  leaderId: z.string().optional(),
});

type CellGroupFormValues = z.infer<typeof cellGroupSchema>;

interface CellGroup {
  id: string;
  name: string;
  leader?: {
    firstName: string;
    lastName: string;
  };
  _count?: {
    members: number;
  };
}

export function CellGroupsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CellGroup | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<CellGroupFormValues>({
    resolver: zodResolver(cellGroupSchema),
    defaultValues: {
      name: '',
    },
  });

  const { data: cellGroups, isLoading } = useQuery({
    queryKey: ['cellGroups'],
    queryFn: async () => {
      const res = await api.get<CellGroup[]>('/cellgroups');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CellGroupFormValues) => {
      await api.post('/cellgroups', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cellGroups'] });
      setIsOpen(false);
      form.reset();
      toast.success('Cell Group created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CellGroupFormValues }) => {
      await api.put(`/cellgroups/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cellGroups'] });
      setIsOpen(false);
      setEditingGroup(null);
      form.reset();
      toast.success('Cell Group updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cellgroups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cellGroups'] });
      toast.success('Cell Group deleted successfully');
    },
  });

  const onSubmit = (data: CellGroupFormValues) => {
    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (group: CellGroup) => {
    setEditingGroup(group);
    form.reset({ name: group.name });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingGroup(null);
      form.reset({ name: '' });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading cell groups...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Cell Groups</h1>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Cell Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGroup ? 'Edit Cell Group' : 'Add Cell Group'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Cell Group Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Leader selection could be added here later */}
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Leader</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cellGroups?.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>
                  {group.leader ? `${group.leader.firstName} ${group.leader.lastName}` : 'None'}
                </TableCell>
                <TableCell>{group._count?.members || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this cell group?')) {
                          deleteMutation.mutate(group.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {cellGroups?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No cell groups found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
