// mguimaraesn/decola-vagas/Decola-Vagas-refactor-auth-logic/frontend/app/(admin)/admin/users/page.tsx

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
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
  id: number; 
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // State for the create user form
  const [createUserForm, setCreateUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    institutionId: '',
    roleId: '',
  });

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
    document.title = 'Admin: Usuários | Decola Vagas';
  }, []);

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

    if (!userInstitutionRoleId) {
        toast.error("ID do cargo não encontrado. Não é possível remover.");
        return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/remove-role/${userInstitutionRoleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Cargo removido com sucesso!');

        // Optimistically update the UI
        const updatedInstitutions = selectedUser.institutions.filter(
          (instRole) => instRole.id !== userInstitutionRoleId
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

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...createUserForm,
          institutionId: parseInt(createUserForm.institutionId),
          roleId: parseInt(createUserForm.roleId),
        }),
      });

      if (res.ok) {
        toast.success('Usuário criado com sucesso!');
        setIsCreateModalOpen(false);
        fetchData(); // Refresh the user list
        // Reset form
        setCreateUserForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          institutionId: '',
          roleId: '',
        });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao criar usuário.');
      }
    } catch (error) {
      toast.error('Erro de rede ao criar usuário.');
    }
  };

  const handleDeleteUser = async () => {
    if (!token || !userToDelete) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok || res.status === 204) {
        toast.success('Usuário excluído com sucesso!');
        setUserToDelete(null);
        fetchData(); // Re-fetch
      } else {
        toast.error('Falha ao excluir usuário.');
      }
    } catch (error) {
      toast.error('Erro de rede ao excluir usuário.');
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    // Div container removida para preencher o layout
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>Novo Usuário</Button>
      </div>
      {/* Card padronizado em volta da tabela */}
      <div className="bg-white rounded-lg shadow-sm border">
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
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                    Gerenciar Permissões
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setUserToDelete(user)}>
                    Excluir
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
                <div key={instRole.id} className="flex justify-between items-center p-2 rounded-md border">
                  <span>{instRole.institution.name} - <strong>{instRole.role.name}</strong></span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveRole(instRole.id)} 
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

      {/* Create User Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os detalhes abaixo para criar um novo usuário e atribuir um cargo inicial.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nome"
                  value={createUserForm.firstName}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, firstName: e.target.value })}
                  required
                />
                <Input
                  placeholder="Sobrenome"
                  value={createUserForm.lastName}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, lastName: e.target.value })}
                  required
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Senha"
                value={createUserForm.password}
                onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                required
              />
              <Select
                value={createUserForm.institutionId}
                onValueChange={(value) => setCreateUserForm({ ...createUserForm, institutionId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma instituição" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={String(inst.id)}>{inst.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={createUserForm.roleId}
                onValueChange={(value) => setCreateUserForm({ ...createUserForm, roleId: value })}
                required
              >
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Criar Usuário</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário "{userToDelete?.firstName} {userToDelete?.lastName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}