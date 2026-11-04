# Ruta Segura

Aplicación comunitaria para reportar y consultar situaciones de riesgo (acoso, iluminación deficiente, zonas desoladas) en Facatativá y municipios cercanos.

## Tecnología
Next.js 16 · React 19 · Payload CMS · PostgreSQL (Neon) · Tailwind CSS 4 · Leaflet

## Estructura (MVC) — `src/`
- `models/` — tipos, constantes, validaciones y normalización de datos
- `services/` — llamadas a la API (`/api/...`)
- `controllers/` — hooks con la lógica de cada pantalla
- `views/` — páginas y componentes de interfaz
- `collections/` — modelos de datos de Payload
- `app/` — rutas de Next.js (páginas y API)

## Ejecutar
```bash
pnpm install
cp .env.example .env.local   # completa DATABASE_URL y PAYLOAD_SECRET
pnpm dev
```
