'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'CAPTURISTA', 'REVISOR']),
});
type FormData = z.infer<typeof schema>;

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  CAPTURISTA: 'bg-blue-100 text-blue-700',
  REVISOR: 'bg-green-100 text-green-700',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CAPTURISTA' },
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/api/users').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/api/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado exitosamente');
      setOpen(false);
      reset();
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Error creando usuario'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario desactivado');
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 mt-1">Gestión de acceso al sistema notarial</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Usuario
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 mt-2">
              <div>
                <Label>Nombre Completo</Label>
                <Input className="mt-1" {...register('name')} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Correo Electrónico</Label>
                <Input className="mt-1" type="email" {...register('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label>Contraseña</Label>
                <Input className="mt-1" type="password" {...register('password')} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <Label>Rol</Label>
                <Select defaultValue="CAPTURISTA" onValueChange={(v) => setValue('role', v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="CAPTURISTA">Capturista</SelectItem>
                    <SelectItem value="REVISOR">Revisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="space-y-3">
          {users.map((u: any) => (
            <Card key={u.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {u.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                    <span className={`text-xs ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <p className="text-xs text-gray-400">
                      {format(new Date(u.createdAt), 'dd MMM yyyy', { locale: es })}
                    </p>
                    {u.isActive && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Desactivar a ${u.name}?`)) deleteMutation.mutate(u.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
