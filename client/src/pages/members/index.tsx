import { useEffect } from 'react';
import { useMemberStore } from '@/stores/member.store';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MemberList() {
  const { members, isLoading, error, fetchMembers, deleteMember } = useMemberStore();

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      await deleteMember(id);
    }
  };

  if (isLoading && members.length === 0) return <div className="p-4">Loading members...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading members: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Members</h1>
        <Link to="/members/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cell Group</TableHead>
              <TableHead>Family</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center">
                    {member.photoUrl && (
                      <img className="h-8 w-8 rounded-full mr-3" src={member.photoUrl} alt="" />
                    )}
                    <div className="font-medium">
                      {member.firstName} {member.lastName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    member.status === 'INACTIVE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {member.status}
                  </span>
                </TableCell>
                <TableCell>
                  {member.cellGroup?.name || '-'}
                </TableCell>
                <TableCell>
                  {member.family?.name || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/members/${member.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
