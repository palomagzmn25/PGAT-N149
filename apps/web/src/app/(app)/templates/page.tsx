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
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.enum(['sociedad_anonima', 'poder_notarial', 'custom']),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const typeLabels: Record<string, string> = {
  sociedad_anonima: 'Sociedad Anónima',
  poder_notarial: 'Poder Notarial',
  custom: 'Personalizado',
};

export default function TemplatesPage() {
  const user = getUser();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/api/templates').then((r) => r.data),
  });

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'sociedad_anonima' },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: globalThis.FormData) =>
      api.post('/api/templates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      const placeholders = res.data.placeholders as string[];
      toast.success(`Plantilla cargada. ${placeholders.length} placeholders detectados.`);
      setOpen(false);
      reset();
      setFile(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Error al subir plantilla'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Plantilla eliminada');
    },
  });

  const onSubmit = (data: FormData) => {
    if (!file) { toast.error('Selecciona un archivo .docx'); return; }
    const fd = new globalThis.FormData();
    fd.append('file', file);
    fd.append('name', data.name);
    fd.append('type', data.type);
    if (data.description) fd.append('description', data.description);
    uploadMutation.mutate(fd);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantillas</h1>
          <p className="text-gray-500 mt-1">Machotes notariales con placeholders dinámicos</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Subir Plantilla
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Subir Plantilla DOCX</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div>
                  <Label>Nombre</Label>
                  <Input className="mt-1" placeholder="Ej: Sociedad Anónima v3" {...register('name')} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label>Tipo de Instrumento</Label>
                  <Select defaultValue="sociedad_anonima" onValueChange={(v) => setValue('type', v as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sociedad_anonima">Sociedad Anónima</SelectItem>
                      <SelectItem value="poder_notarial">Poder Notarial</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descripción (opcional)</Label>
                  <Textarea className="mt-1" rows={2} {...register('description')} />
                </div>
                <div>
                  <Label>Archivo .docx</Label>
                  <div
                    className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => document.getElementById('docx-upload')?.click()}
                  >
                    {file ? (
                      <p className="text-sm text-blue-700 font-medium">{file.name}</p>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-500">Arrastra o haz clic para seleccionar</p>
                        <p className="text-xs text-gray-400 mt-1">Solo archivos .docx</p>
                      </>
                    )}
                    <input
                      id="docx-upload"
                      type="file"
                      accept=".docx"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Subiendo...' : 'Subir y Detectar Placeholders'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando plantillas...</div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No hay plantillas aún</p>
            {isAdmin && <p className="text-gray-400 text-sm mt-1">Sube tu primer machote .docx</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t: any) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{t.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {typeLabels[t.type] ?? t.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">v{t.version}</span>
                </div>
              </CardHeader>
              <CardContent>
                {t.description && (
                  <p className="text-xs text-gray-500 mb-3">{t.description}</p>
                )}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1.5">
                    Placeholders detectados ({(t.placeholders as string[]).length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(t.placeholders as string[]).slice(0, 6).map((p: string) => (
                      <span key={p} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-mono">
                        {'{{'}{p}{'}}'}
                      </span>
                    ))}
                    {(t.placeholders as string[]).length > 6 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                        +{(t.placeholders as string[]).length - 6} más
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {format(new Date(t.createdAt), 'dd MMM yyyy', { locale: es })}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar esta plantilla?')) deleteMutation.mutate(t.id);
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
