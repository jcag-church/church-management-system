import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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

const familySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type FamilyFormValues = z.infer<typeof familySchema>;

interface Family {
  id: string;
  name: string;
  createdAt: string;
  _count?: {
    members: number;
  };
}

export function FamiliesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: '',
    },
  });

  const { data: families, isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const res = await api.get<Family[]>('/families');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FamilyFormValues) => {
      await api.post('/families', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setIsOpen(false);
      form.reset();
      toast.success('Family created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FamilyFormValues }) => {
      await api.put(`/families/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setIsOpen(false);
      setEditingFamily(null);
      form.reset();
      toast.success('Family updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/families/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      toast.success('Family deleted successfully');
    },
  });

  const onSubmit = (data: FamilyFormValues) => {
    if (editingFamily) {
      updateMutation.mutate({ id: editingFamily.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (family: Family) => {
    setEditingFamily(family);
    form.reset({ name: family.name });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingFamily(null);
      form.reset({ name: '' });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading families...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Families</h1>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Family
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFamily ? 'Edit Family' : 'Add Family'}</DialogTitle>
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
                        <Input placeholder="Family Name" {...field} />
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
              <TableHead>Members</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {families?.map((family) => (
              <TableRow key={family.id}>
                <TableCell className="font-medium">{family.name}</TableCell>
                <TableCell>{family._count?.members || 0}</TableCell>
                <TableCell>
                  {format(new Date(family.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(family)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this family?')) {
                          deleteMutation.mutate(family.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {families?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No families found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
