'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function StatCard({ title, value, icon, color }: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/api/dashboard/stats').then((r) => r.data),
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen de actividad notarial</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Instrumentos Generados"
          value={isLoading ? '...' : stats?.totalDocuments ?? 0}
          color="bg-blue-100"
          icon={
            <svg className="w-6 h-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="OCR Procesados"
          value={isLoading ? '...' : stats?.totalOcr ?? 0}
          color="bg-purple-100"
          icon={
            <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Plantillas Activas"
          value={isLoading ? '...' : stats?.totalTemplates ?? 0}
          color="bg-green-100"
          icon={
            <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : stats?.recentDocuments?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No hay instrumentos generados aún. ¡Crea tu primer instrumento!
            </p>
          ) : (
            <div className="space-y-3">
              {stats?.recentDocuments?.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.template?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Por {doc.user?.name} · {format(new Date(doc.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                  <Badge variant={doc.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">
                    {doc.status === 'COMPLETED' ? 'Completado' : doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
