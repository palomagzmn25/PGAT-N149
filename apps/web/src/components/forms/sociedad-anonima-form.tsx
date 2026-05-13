'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function Field({
  label,
  name,
  register,
  errors,
  required = false,
  placeholder = '',
  type = 'text',
}: {
  label: string;
  name: string;
  register: any;
  errors: any;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  const error = name.split('.').reduce((o: any, k) => o?.[k], errors);
  return (
    <div>
      <Label className={required ? "after:content-['*'] after:text-red-500 after:ml-0.5" : ''}>
        {label}
      </Label>
      <Input className="mt-1" type={type} placeholder={placeholder} {...register(name)} />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

export function SociedadAnonimaForm({ form }: { form: UseFormReturn<any> }) {
  const { register, control, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'socios' });

  return (
    <div className="space-y-6">
      {/* Datos Generales */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Datos del Instrumento</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Número de Instrumento" name="numero_instrumento" register={register} errors={errors} required />
          <Field label="Número de Volumen" name="numero_volumen" register={register} errors={errors} required />
          <Field label="Número de Folios" name="numero_folios" register={register} errors={errors} required />
          <Field label="Día (en letra)" name="dia_letra" register={register} errors={errors} placeholder="veintiuno" />
          <Field label="Mes (en letra)" name="mes_letra" register={register} errors={errors} placeholder="enero" />
          <Field label="Año (en letra)" name="anio_letra" register={register} errors={errors} placeholder="dos mil veinticinco" />
        </div>
      </div>

      <Separator />

      {/* Empresa */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Datos de la Sociedad</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nombre de la Empresa" name="nombre_empresa" register={register} errors={errors} required placeholder="EMPRESA NOTARIAL, S.A. de C.V." />
          </div>
          <Field label="Ciudad y Estado" name="ciudad_estado" register={register} errors={errors} placeholder="Toluca, Estado de México" />
          <Field label="Duración de la Sociedad" name="duracion_sociedad" register={register} errors={errors} placeholder="noventa y nueve años" />
          <div className="col-span-2">
            <Label>Objeto Social</Label>
            <Textarea className="mt-1" rows={3} {...register('objeto_social')} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Capital */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Capital Social</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Capital Mínimo (en letra)" name="capital_minimo_letra" register={register} errors={errors} placeholder="cincuenta mil pesos" />
          <Field label="Número de Acciones (en letra)" name="numero_acciones_letra" register={register} errors={errors} placeholder="cincuenta" />
          <Field label="Valor Nominal (en letra)" name="valor_nominal_letra" register={register} errors={errors} placeholder="mil pesos" />
          <Field label="Importe de Acciones (en letra)" name="importe_acciones_letra" register={register} errors={errors} placeholder="cincuenta mil pesos" />
        </div>
      </div>

      <Separator />

      {/* Socios */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Socios</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ nombre_completo: '', rfc: '', rfc_letra: '' })}
          >
            + Agregar Socio
          </Button>
        </div>
        {fields.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4 border-2 border-dashed rounded-lg">
            Agrega al menos un socio
          </p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Socio {index + 1}</span>
              <button type="button" onClick={() => remove(index)} className="text-red-500 text-xs hover:text-red-700">
                Eliminar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label="Nombre Completo" name={`socios.${index}.nombre_completo`} register={register} errors={errors} required />
              </div>
              <Field label="RFC" name={`socios.${index}.rfc`} register={register} errors={errors} placeholder="HOOM820521SU7" />
              <Field label="RFC en Letra (opcional)" name={`socios.${index}.rfc_letra`} register={register} errors={errors} placeholder="Se genera automáticamente" />
            </div>
          </div>
        ))}
        <div className="mt-2">
          <Field label="Nombres de Socios (resumen)" name="nombres_socios" register={register} errors={errors} placeholder="Ej: Juan Pérez y María García" />
        </div>
      </div>

      <Separator />

      {/* Compareciente Principal */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Compareciente Principal</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nombre Completo" name="nombre_completo" register={register} errors={errors} required />
          </div>
          <Field label="Nacionalidad" name="nacionalidad" register={register} errors={errors} placeholder="mexicana" />
          <Field label="Lugar de Nacimiento" name="lugar_nacimiento" register={register} errors={errors} />
          <Field label="Fecha de Nacimiento (en letra)" name="fecha_nacimiento_letra" register={register} errors={errors} placeholder="veintiuno de mayo de mil novecientos ochenta y dos" />
          <Field label="Estado Civil" name="estado_civil" register={register} errors={errors} placeholder="casado" />
          <Field label="Profesión" name="profesion" register={register} errors={errors} placeholder="licenciado en derecho" />
          <div className="col-span-2">
            <Field label="Domicilio Completo" name="domicilio_completo" register={register} errors={errors} />
          </div>
          <Field label="Tipo de Identificación" name="tipo_identificacion" register={register} errors={errors} placeholder="credencial para votar" />
          <Field label="Autoridad que Expide" name="autoridad_identificacion" register={register} errors={errors} placeholder="Instituto Nacional Electoral" />
          <Field label="CUD / Folio" name="cud" register={register} errors={errors} />
          <Field label="CUD en Letra" name="cud_letra" register={register} errors={errors} />
          <Field label="Fecha CUD (en letra)" name="fecha_cud" register={register} errors={errors} />
          <Field label="CURP en Letra" name="curp_letra" register={register} errors={errors} />
          <Field label="Clave de Elector en Letra" name="clave_elector_letra" register={register} errors={errors} />
          <Field label="RFC" name="rfc" register={register} errors={errors} placeholder="HOOM820521SU7" />
          <Field label="RFC en Letra" name="rfc_letra" register={register} errors={errors} placeholder="Se genera automáticamente" />
        </div>
      </div>

      <Separator />

      {/* Administrador */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Administrador Único</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nombre del Administrador" name="nombre_administrador" register={register} errors={errors} required />
          </div>
          <Field label="RFC del Administrador" name="rfc_administrador" register={register} errors={errors} />
          <Field label="RFC en Letra" name="rfc_administrador_letra" register={register} errors={errors} />
        </div>
      </div>

      <Separator />

      {/* Comisario */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Comisario</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nombre del Comisario" name="nombre_comisario" register={register} errors={errors} required />
          </div>
          <Field label="RFC del Comisario" name="rfc_comisario" register={register} errors={errors} />
          <Field label="RFC en Letra" name="rfc_comisario_letra" register={register} errors={errors} />
        </div>
      </div>

      <Separator />

      {/* Apéndice */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Referencias del Instrumento</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Apéndice" name="apendice" register={register} errors={errors} placeholder="A" />
          <Field label="Inciso (minúscula)" name="inciso" register={register} errors={errors} placeholder="a" />
          <Field label="Inciso (MAYÚSCULA)" name="inciso_mayus" register={register} errors={errors} placeholder="A" />
          <Field label="Marcador" name="marcador" register={register} errors={errors} />
        </div>
      </div>
    </div>
  );
}
