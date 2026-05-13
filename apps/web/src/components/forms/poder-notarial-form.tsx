'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

function Field({
  label, name, register, errors, required = false, placeholder = '', type = 'text',
}: {
  label: string; name: string; register: any; errors: any;
  required?: boolean; placeholder?: string; type?: string;
}) {
  const error = name.split('.').reduce((o: any, k) => o?.[k], errors);
  return (
    <div>
      <Label className={required ? "after:content-['*'] after:text-red-500 after:ml-0.5" : ''}>{label}</Label>
      <Input className="mt-1" type={type} placeholder={placeholder} {...register(name)} />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

export function PoderNotarialForm({ form }: { form: UseFormReturn<any> }) {
  const { register, formState: { errors } } = form;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Datos del Instrumento</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Número de Instrumento" name="numero_instrumento" register={register} errors={errors} required />
          <Field label="Número de Volumen" name="numero_volumen" register={register} errors={errors} required />
          <Field label="Número de Folios" name="numero_folios" register={register} errors={errors} required />
          <Field label="Acto Notarial" name="acto" register={register} errors={errors} placeholder="Poder Notarial" />
          <Field label="Día (en letra)" name="dia_letra" register={register} errors={errors} />
          <Field label="Mes (en letra)" name="mes_letra" register={register} errors={errors} />
          <Field label="Año (en letra)" name="anio_letra" register={register} errors={errors} />
          <Field label="Ciudad y Estado" name="ciudad_estado" register={register} errors={errors} />
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Otorgante</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nombre Completo del Otorgante" name="nombre_completo" register={register} errors={errors} required />
          </div>
          <Field label="Nacionalidad" name="nacionalidad" register={register} errors={errors} placeholder="mexicana" />
          <Field label="Lugar de Nacimiento" name="lugar_nacimiento" register={register} errors={errors} />
          <Field label="Fecha de Nacimiento (en letra)" name="fecha_nacimiento_letra" register={register} errors={errors} />
          <Field label="Estado Civil" name="estado_civil" register={register} errors={errors} />
          <Field label="Profesión" name="profesion" register={register} errors={errors} />
          <div className="col-span-2">
            <Field label="Domicilio" name="domicilio_completo" register={register} errors={errors} />
          </div>
          <Field label="Tipo de Identificación" name="tipo_identificacion" register={register} errors={errors} />
          <Field label="Autoridad que Expide" name="autoridad_identificacion" register={register} errors={errors} />
          <Field label="CUD / Folio" name="cud" register={register} errors={errors} />
          <Field label="CUD en Letra" name="cud_letra" register={register} errors={errors} />
          <Field label="Fecha CUD" name="fecha_cud" register={register} errors={errors} />
          <Field label="CURP en Letra" name="curp_letra" register={register} errors={errors} />
          <Field label="Clave de Elector en Letra" name="clave_elector_letra" register={register} errors={errors} />
          <Field label="RFC" name="rfc" register={register} errors={errors} />
          <Field label="RFC en Letra" name="rfc_letra" register={register} errors={errors} />
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Apoderada</h3>
        <Field label="Nombre de la Apoderada" name="nombre_apoderada" register={register} errors={errors} required />
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Notario</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre del Notario" name="nombre_notario" register={register} errors={errors} />
          <Field label="Número de Notaría" name="numero_notaria" register={register} errors={errors} />
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Facultades y Vigencia</h3>
        <div className="space-y-4">
          <div>
            <Label>Facultades</Label>
            <Textarea className="mt-1" rows={3} {...register('facultades')} />
          </div>
          <div>
            <Label>Limitaciones</Label>
            <Textarea className="mt-1" rows={2} {...register('limitaciones')} />
          </div>
          <Field label="Vigencia" name="vigencia" register={register} errors={errors} placeholder="un año a partir de la fecha de su otorgamiento" />
        </div>
      </div>
    </div>
  );
}
