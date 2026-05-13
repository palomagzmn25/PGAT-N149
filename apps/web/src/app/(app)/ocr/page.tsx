'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type OcrMode = 'tesseract' | 'claude';

const MODES: { value: OcrMode; label: string; description: string; badge: string; badgeClass: string }[] = [
  {
    value: 'tesseract',
    label: 'Automático',
    description: 'OCR local con Tesseract. Sin conexión externa ni costo por uso. Ideal para documentos con texto claro.',
    badge: 'Sin costo',
    badgeClass: 'bg-green-100 text-green-700',
  },
  {
    value: 'claude',
    label: 'Claude AI',
    description: 'Transcripción contextual con inteligencia artificial. Mayor fidelidad en documentos complejos, tablas y texto degradado.',
    badge: 'Requiere API Key',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: 'Completado', className: 'bg-green-100 text-green-700' },
    PROCESSING: { label: 'Procesando', className: 'bg-yellow-100 text-yellow-700' },
    FAILED: { label: 'Error', className: 'bg-red-100 text-red-700' },
    PENDING: { label: 'Pendiente', className: 'bg-gray-100 text-gray-600' },
  };
  const config = map[status] ?? map.PENDING;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>{config.label}</span>;
}

function ProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null;
  const isClaude = provider === 'claude';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${isClaude ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
      {isClaude ? 'Claude AI' : 'Automático'}
    </span>
  );
}

export default function OcrPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<OcrMode>('tesseract');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['ocr-jobs'],
    queryFn: () => api.get('/api/ocr').then((r) => r.data),
    refetchInterval: (query) => {
      const data = query.state.data as any[];
      const hasProcessing = data?.some?.((j) => j.status === 'PROCESSING' || j.status === 'PENDING');
      return hasProcessing ? 3000 : false;
    },
  });

  const processMutation = useMutation({
    mutationFn: (fd: FormData) =>
      api.post('/api/ocr/process', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Documento enviado para procesamiento OCR');
      setSelectedFile(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Error procesando documento'),
    onSettled: () => setUploading(false),
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setSelectedFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
  });

  const handleProcess = () => {
    if (!selectedFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('provider', mode);
    processMutation.mutate(fd);
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await api.get(`/api/ocr/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcripcion_${id}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al descargar la transcripción');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">OCR / Transcripción</h1>
        <p className="text-gray-500 mt-1">Transcripción fiel de documentos escaneados a Word</p>
      </div>

      {/* Upload zone */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Procesar Documento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Mode selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Modo de transcripción</p>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    mode === m.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-semibold text-sm ${mode === m.value ? 'text-blue-700' : 'text-gray-800'}`}>
                      {m.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.badgeClass}`}>
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
                  {mode === m.value && (
                    <div className="mt-2 flex items-center gap-1 text-blue-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">Seleccionado</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* File drop */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Archivo a transcribir</p>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {selectedFile ? (
                <div>
                  <p className="font-medium text-blue-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(0)} KB · {selectedFile.type}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="text-xs text-red-500 mt-2 hover:text-red-700"
                  >
                    Quitar archivo
                  </button>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-700">
                    {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra o haz clic para seleccionar'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">PDF, JPG o PNG · Máximo 50MB</p>
                </div>
              )}
            </div>
          </div>

          {selectedFile && (
            <Button
              onClick={handleProcess}
              disabled={uploading}
              className="w-full bg-blue-700 hover:bg-blue-800"
            >
              {uploading
                ? 'Enviando...'
                : `Transcribir con ${mode === 'claude' ? 'Claude AI' : 'OCR Automático'}`}
            </Button>
          )}

          {/* Rules info */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-1">Reglas de transcripción (ambos modos):</p>
            <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
              <li>Se preservan saltos de línea, párrafos y alineaciones</li>
              <li>No se corrige ortografía ni se resume el contenido</li>
              <li>Texto ilegible se marca como [ilegible]</li>
              <li>Se genera reporte de secciones no reconocidas al final del DOCX</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Jobs list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Procesamientos</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Cargando...</div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">No hay procesamientos aún</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm">
                          {job.inputPath?.split('/').pop() ?? 'Documento'}
                        </p>
                        <StatusBadge status={job.status} />
                        <ProviderBadge provider={job.provider} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {job.pageCount ? `${job.pageCount} págs. · ` : ''}
                        {format(new Date(job.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                      {job.status === 'PROCESSING' && (
                        <Progress value={null} className="mt-2 h-1 w-48" />
                      )}
                      {job.status === 'FAILED' && job.errorReport && (
                        <p className="text-xs text-red-500 mt-1 max-w-xs truncate">{job.errorReport}</p>
                      )}
                    </div>
                    {job.status === 'COMPLETED' && job.outputPath && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(job.id)}
                        className="ml-4 text-blue-700 border-blue-200 hover:bg-blue-50 shrink-0"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Descargar DOCX
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
