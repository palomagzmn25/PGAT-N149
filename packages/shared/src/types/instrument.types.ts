export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SocioData {
  nombre_completo: string;
  rfc: string;
  rfc_letra: string;
}

export interface SociedadAnonimaFormData {
  numero_instrumento: string;
  numero_volumen: string;
  numero_folios: string;
  dia_letra: string;
  mes_letra: string;
  anio_letra: string;
  nombre_empresa: string;
  ciudad_estado: string;
  duracion_sociedad: string;
  objeto_social: string;
  // Capital
  capital_minimo_letra: string;
  numero_acciones_letra: string;
  valor_nominal_letra: string;
  importe_acciones_letra: string;
  // Socios (array)
  socios: SocioData[];
  nombres_socios: string;
  // Administrador
  nombre_administrador: string;
  rfc_administrador: string;
  rfc_administrador_letra: string;
  // Comisario
  nombre_comisario: string;
  rfc_comisario: string;
  rfc_comisario_letra: string;
  // Compareciente principal
  nombre_completo: string;
  nacionalidad: string;
  lugar_nacimiento: string;
  fecha_nacimiento_letra: string;
  estado_civil: string;
  profesion: string;
  domicilio_completo: string;
  tipo_identificacion: string;
  autoridad_identificacion: string;
  cud: string;
  cud_letra: string;
  fecha_cud: string;
  curp_letra: string;
  clave_elector_letra: string;
  rfc: string;
  rfc_letra: string;
  apendice: string;
  inciso: string;
  inciso_mayus: string;
  marcador: string;
}

export interface PoderNotarialFormData {
  numero_instrumento: string;
  numero_volumen: string;
  numero_folios: string;
  dia_letra: string;
  mes_letra: string;
  anio_letra: string;
  ciudad_estado: string;
  acto: string;
  // Otorgante
  nombre_completo: string;
  nacionalidad: string;
  lugar_nacimiento: string;
  fecha_nacimiento_letra: string;
  estado_civil: string;
  profesion: string;
  domicilio_completo: string;
  tipo_identificacion: string;
  autoridad_identificacion: string;
  cud: string;
  cud_letra: string;
  fecha_cud: string;
  curp_letra: string;
  clave_elector_letra: string;
  rfc: string;
  rfc_letra: string;
  // Apoderada
  nombre_apoderada: string;
  // Notario
  nombre_notario: string;
  numero_notaria: string;
  // Facultades
  facultades: string;
  limitaciones: string;
  vigencia: string;
}

export interface GeneratedDocumentDto {
  id: string;
  templateId: string;
  instrumentType: string;
  status: DocumentStatus;
  formData: Record<string, unknown>;
  createdAt: string;
}

export interface GenerateInstrumentDto {
  templateId: string;
  instrumentType: string;
  formData: Record<string, unknown>;
}
