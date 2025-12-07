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

const ministrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type MinistryFormValues = z.infer<typeof ministrySchema>;

interface Ministry {
  id: string;
  name: string;
  description?: string;
  _count?: {
    members: number;
  };
}

export function MinistriesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<MinistryFormValues>({
    resolver: zodResolver(ministrySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { data: ministries, isLoading } = useQuery({
    queryKey: ['ministries'],
    queryFn: async () => {
      const res = await api.get<Ministry[]>('/ministries');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MinistryFormValues) => {
      await api.post('/ministries', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      setIsOpen(false);
      form.reset();
      toast.success('Ministry created successfully');
    },
    onError: (error: unknown) => {
        const err = error as any;
        if (err.response?.data?.error) {
            toast.error(err.response.data.error);
        } else {
            toast.error('Failed to create ministry');
        }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MinistryFormValues }) => {
      await api.put(`/ministries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      setIsOpen(false);
      setEditingMinistry(null);
      form.reset();
      toast.success('Ministry updated successfully');
    },
    onError: (error: unknown) => {
        const err = error as any;
        if (err.response?.data?.error) {
            toast.error(err.response.data.error);
        } else {
            toast.error('Failed to update ministry');
        }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ministries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      toast.success('Ministry deleted successfully');
    },
    onError: (error: unknown) => {
        const err = error as any;
        if (err.response?.data?.error) {
            toast.error(err.response.data.error);
        } else {
            toast.error('Failed to delete ministry');
        }
    }
  });

  const onSubmit = (data: MinistryFormValues) => {
    if (editingMinistry) {
      updateMutation.mutate({ id: editingMinistry.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    form.reset({ 
        name: ministry.name,
        description: ministry.description || '' 
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingMinistry(null);
      form.reset({ name: '', description: '' });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading ministries...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Ministries</h1>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Ministry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMinistry ? 'Edit Ministry' : 'Add Ministry'}</DialogTitle>
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
                        <Input placeholder="Ministry Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Description (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <TableHead>Description</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ministries?.map((ministry) => (
              <TableRow key={ministry.id}>
                <TableCell className="font-medium">{ministry.name}</TableCell>
                <TableCell>{ministry.description || '-'}</TableCell>
                <TableCell>{ministry._count?.members || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(ministry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this ministry?')) {
                          deleteMutation.mutate(ministry.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ministries?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No ministries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
