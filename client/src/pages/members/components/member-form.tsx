import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberSchema } from '@/schemas/member.schema';
import type { Member } from '@/schemas/member.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useMemberStore } from '@/stores/member.store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MemberFormProps {
  initialData?: Member;
  isEdit?: boolean;
}

export default function MemberForm({ initialData, isEdit = false }: MemberFormProps) {
  const navigate = useNavigate();
  const { addMember, updateMember } = useMemberStore();

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(createMemberSchema),
    defaultValues: initialData ? {
      ...initialData,
      familyId: initialData.family?.id || initialData.familyId,
      cellGroupId: initialData.cellGroup?.id || initialData.cellGroupId,
    } : {
      status: 'VISITOR',
    },
  });

  // Fetch Families
  const { data: families } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const res = await api.get('/families');
      return res.data;
    },
  });

  // Fetch Cell Groups
  const { data: cellGroups } = useQuery({
    queryKey: ['cellGroups'],
    queryFn: async () => {
      const res = await api.get('/cellgroups');
      return res.data;
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (isEdit && initialData) {
        await updateMember(initialData.id, data);
      } else {
        await addMember(data);
      }
      navigate('/members');
    } catch (error) {
      console.error('Failed to save member:', error);
    }
  };

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4 max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Member' : 'Add New Member'}</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <Input {...register('firstName')} className="mt-1" />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <Input {...register('lastName')} className="mt-1" />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input {...register('email')} type="email" className="mt-1" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <Input {...register('phone')} className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Family</label>
          <Controller
            control={control}
            name="familyId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!families?.length}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={families?.length ? "Select Family" : "No families available"} />
                </SelectTrigger>
                <SelectContent>
                  {families?.map((family: any) => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cell Group</label>
          <Controller
            control={control}
            name="cellGroupId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!cellGroups?.length}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={cellGroups?.length ? "Select Cell Group" : "No groups available"} />
                </SelectTrigger>
                <SelectContent>
                  {cellGroups?.map((group: any) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
          <option value="VISITOR">Visitor</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Add other fields like gender, dob, address, etc. as needed */}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => navigate('/members')}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Member'}
        </Button>
      </div>
    </form>
  );
}
