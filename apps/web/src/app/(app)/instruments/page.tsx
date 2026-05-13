'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SociedadAnonimaForm } from '@/components/forms/sociedad-anonima-form';
import { PoderNotarialForm } from '@/components/forms/poder-notarial-form';

const INSTRUMENT_TYPES = [
  { value: 'sociedad_anonima', label: 'Sociedad Anónima', description: 'Constitución de SA, SA de CV' },
  { value: 'poder_notarial', label: 'Poder Notarial', description: 'Poderes generales y especiales' },
];

type WizardStep = 'select-type' | 'select-template' | 'fill-form' | 'done';

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

function WizardNewInstrument({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<WizardStep>('select-type');
  const [instrumentType, setInstrumentType] = useState('');
  const [templateId, setTemplateId] = useState('');

  const form = useForm<any>({ defaultValues: { socios: [] } });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/api/templates').then((r) => r.data),
  });

  const filteredTemplates = templates.filter(
    (t: any) => t.type === instrumentType || t.type === 'custom',
  );

  const generateMutation = useMutation({
    mutationFn: (data: any) =>
      api.post('/api/instruments/generate', {
        templateId,
        instrumentType,
        formData: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instruments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setStep('done');
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Error generando instrumento'),
  });

  const selectedTemplate = templates.find((t: any) => t.id === templateId);

  if (step === 'done') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Instrumento Generado</h3>
        <p className="text-gray-500 text-sm mb-6">El documento DOCX ha sido generado exitosamente</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onClose}>Ver Historial</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Tipo', 'Plantilla', 'Datos'].map((s, i) => {
          const stepValues: WizardStep[] = ['select-type', 'select-template', 'fill-form'];
          const current = stepValues.indexOf(step);
          const active = i <= current;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${active ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < 2 && <div className={`h-px w-8 ${active && i < current ? 'bg-blue-700' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Select type */}
      {step === 'select-type' && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Selecciona el tipo de instrumento</h3>
          <div className="grid grid-cols-2 gap-4">
            {INSTRUMENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setInstrumentType(t.value); setStep('select-template'); }}
                className="p-5 border-2 border-gray-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 transition-colors group"
              >
                <p className="font-semibold text-gray-900 group-hover:text-blue-700">{t.label}</p>
                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select template */}
      {step === 'select-template' && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Selecciona la plantilla</h3>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No hay plantillas disponibles para este tipo</p>
              <p className="text-xs mt-1">Pide al administrador que suba una plantilla</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => { setTemplateId(t.id); setStep('fill-form'); }}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-700">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{(t.placeholders as string[]).length} placeholders · v{t.version}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
          <Button variant="ghost" className="mt-4" onClick={() => setStep('select-type')}>
            ← Volver
          </Button>
        </div>
      )}

      {/* Step 3: Fill form */}
      {step === 'fill-form' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Llenar datos del instrumento</h3>
              <p className="text-xs text-gray-500">Plantilla: {selectedTemplate?.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep('select-template')}>
              ← Volver
            </Button>
          </div>

          <form onSubmit={form.handleSubmit((data) => generateMutation.mutate(data))}>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {instrumentType === 'sociedad_anonima' && <SociedadAnonimaForm form={form} />}
              {instrumentType === 'poder_notarial' && <PoderNotarialForm form={form} />}
            </div>
            <div className="mt-6 pt-4 border-t">
              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800"
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Generando DOCX...' : 'Generar Instrumento'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function InstrumentsPage() {
  const [showWizard, setShowWizard] = useState(false);
  const queryClient = useQueryClient();

  const { data: instruments = [], isLoading } = useQuery({
    queryKey: ['instruments'],
    queryFn: () => api.get('/api/instruments').then((r) => r.data),
  });

  const handleDownload = async (id: string, name: string) => {
    try {
      const res = await api.get(`/api/instruments/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al descargar el documento');
    }
  };

  if (showWizard) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => { setShowWizard(false); queryClient.invalidateQueries({ queryKey: ['instruments'] }); }} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Nuevo Instrumento</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <WizardNewInstrument onClose={() => { setShowWizard(false); queryClient.invalidateQueries({ queryKey: ['instruments'] }); }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instrumentos</h1>
          <p className="text-gray-500 mt-1">Genera y descarga escrituras notariales</p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="bg-blue-700 hover:bg-blue-800">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Instrumento
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : instruments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="text-gray-500 font-medium">No hay instrumentos generados</p>
            <p className="text-gray-400 text-sm mt-1">Haz clic en "Nuevo Instrumento" para comenzar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {instruments.map((doc: any) => (
            <Card key={doc.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">{doc.template?.name ?? 'Instrumento'}</p>
                      <StatusBadge status={doc.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {doc.instrumentType?.replace('_', ' ')} · {doc.user?.name} ·{' '}
                      {format(new Date(doc.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                  {doc.status === 'COMPLETED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.id, doc.template?.name ?? 'instrumento')}
                      className="ml-4 text-blue-700 border-blue-200 hover:bg-blue-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descargar
                    </Button>
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
