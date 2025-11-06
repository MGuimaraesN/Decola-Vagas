// Salve em: frontend/app/(admin)/admin/users/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

// Interfaces
interface Role {
  id: number;
  name: string;
}

interface Institution {
  id: number;
  name: string;
}

interface UserInstitutionRole {
  userInstitutionRoleId: number;
  institution: Institution;
  role: Role;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  institutions: UserInstitutionRole[];
}

const API_BASE_URL = 'http://localhost:5000';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [assignInstitutionId, setAssignInstitutionId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { token } = useAuth();

  const fetchData = async () => {
    if (!token) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);

    try {
      // Fetch users, institutions, and roles in parallel
      const [usersRes, institutionsRes, rolesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/institutions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/roles`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      else toast.error('Falha ao buscar usuários.');

      if (institutionsRes.ok) setInstitutions(await institutionsRes.json());
      else toast.error('Falha ao buscar instituições.');

      if (rolesRes.ok) setRoles(await rolesRes.json());
      else toast.error('Falha ao buscar cargos.');

    } catch (error) {
      toast.error('Erro de rede.');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAssignRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser || !assignInstitutionId || !assignRoleId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/assign-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          institutionId: parseInt(assignInstitutionId),
          roleId: parseInt(assignRoleId),
        }),
      });

      if (res.ok) {
        toast.success('Cargo atribuído com sucesso!');

        // Fetch updated user data
        const updatedUserRes = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if(updatedUserRes.ok) {
          const updatedUser = await updatedUserRes.json();
          setSelectedUser(updatedUser); // Update the selected user state

          // Update the user list state
          setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
        }

        // Reset form
        setAssignInstitutionId('');
        setAssignRoleId('');

      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao atribuir cargo.');
      }
    } catch (error) {
      toast.error('Erro de rede ao atribuir cargo.');
    }
  };

  const handleRemoveRole = async (userInstitutionRoleId: number) => {
    if (!token || !selectedUser) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/remove-role/${userInstitutionRoleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Cargo removido com sucesso!');

        // Optimistically update the UI
        const updatedInstitutions = selectedUser.institutions.filter(
          (instRole) => instRole.userInstitutionRoleId !== userInstitutionRoleId
        );
        const updatedUser = { ...selectedUser, institutions: updatedInstitutions };
        setSelectedUser(updatedUser);

        // Also update the main users list
        setUsers(users.map(user => user.id === selectedUser.id ? updatedUser : user));

      } else {
        toast.error('Falha ao remover cargo.');
      }
    } catch (error) {
      toast.error('Erro de rede ao remover cargo.');
    }
  };

    if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Usuários</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                    Gerenciar Permissões
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(isOpen) => !isOpen && setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar Permissões de {selectedUser?.firstName}</DialogTitle>
            <DialogDescription>
              Visualize, atribua ou remova cargos para este usuário em diferentes instituições.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <h4 className="font-semibold mb-2">Cargos Atuais</h4>
            <div className="space-y-2">
              {selectedUser?.institutions.map((instRole) => (
                <div key={`${instRole.institution.id}-${instRole.role.id}`} className="flex justify-between items-center p-2 rounded-md border">
                  <span>{instRole.institution.name} - <strong>{instRole.role.name}</strong></span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveRole(instRole.userInstitutionRoleId)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <hr />

          <form onSubmit={handleAssignRole}>
            <h4 className="font-semibold mb-2 pt-4">Atribuir Novo Cargo</h4>
            <div className="grid gap-4">
              <div>
                <label htmlFor="institution" className="block text-sm font-medium mb-1">Instituição</label>
                <Select value={assignInstitutionId} onValueChange={setAssignInstitutionId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma instituição" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((inst) => (
                      <SelectItem key={inst.id} value={String(inst.id)}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">Cargo</label>
                <Select value={assignRoleId} onValueChange={setAssignRoleId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Fechar</Button>
              </DialogClose>
              <Button type="submit">Atribuir</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
