# Plataforma de Automatización Notarial

Sistema web para automatizar la generación de instrumentos notariales del Estado de México.

## Requisitos

- Node.js ≥ 20
- Docker y Docker Compose (para PostgreSQL)

## Inicio Rápido

### 1. Clonar y configurar entorno

```bash
cp .env.example apps/api/.env
# Editar apps/api/.env con tus valores si es necesario
```

### 2. Levantar base de datos

```bash
docker-compose up -d
```

### 3. Generar cliente Prisma y migrar DB

```bash
cd apps/api
npx prisma generate
npx prisma db push
cd ../..
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Correr en desarrollo

```bash
# Terminal 1: API (http://localhost:3001)
cd apps/api && npm run dev

# Terminal 2: Web (http://localhost:3000)
cd apps/web && npm run dev
```

### O usar Turborepo para correr todo junto:

```bash
npm run dev
```

## Credenciales por defecto

El sistema crea automáticamente un usuario admin al arrancar por primera vez:

```
Email:    admin@notaria.mx
Password: Admin123!
```

## Estructura

```
notarial-platform/
├── apps/
│   ├── api/          # NestJS API (puerto 3001)
│   └── web/          # Next.js Frontend (puerto 3000)
├── packages/
│   └── shared/       # Tipos TypeScript compartidos
├── docker-compose.yml
└── turbo.json
```

## Módulos MVP Fase 1

- **Auth**: Login JWT con roles (Admin, Capturista, Revisor)
- **Plantillas**: Subir DOCX, detección automática de placeholders
- **Instrumentos**: Sociedad Anónima + Poder Notarial, generación DOCX
- **OCR**: Transcripción de PDF/JPG/PNG con Tesseract (sin credenciales)
- **Dashboard**: Stats y actividad reciente

## OCR Providers

Configura `OCR_PROVIDER` en `apps/api/.env`:

| Provider | Config | Descripción |
|----------|--------|-------------|
| `tesseract` | (ninguna) | Local, sin costo, inglés/español |
| `azure` | `AZURE_OCR_ENDPOINT` + `AZURE_OCR_KEY` | Azure Document Intelligence |
| `claude` | `ANTHROPIC_API_KEY` | Claude Vision, mejor para contexto legal |

## Variables de Entorno

Ver `.env.example` en la raíz del proyecto.
