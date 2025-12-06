import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMemberById } from '@/api/members';
import MemberForm from './components/member-form';

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>();
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member', id],
    queryFn: () => getMemberById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading member</div>;
  if (!member) return <div className="p-6">Member not found</div>;

  return (
    <div className="p-6">
      <MemberForm initialData={member} isEdit />
    </div>
  );
}
