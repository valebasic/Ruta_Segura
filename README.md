# Ruta Segura

Aplicación comunitaria para reportar y consultar situaciones de riesgo en Facatativá y municipios cercanos.

## Tecnología
Next.js 16 · React 19 · Payload CMS · PostgreSQL (Neon) · Tailwind CSS 4 · Leaflet + OpenStreetMap

## Estructura (MVC) — `src/`
- `models/` — tipos, constantes, categorías, validaciones, cálculo de distancias
- `services/` — llamadas a la API (`/api/...`)
- `controllers/` — hooks con la lógica de cada pantalla (sesión, mapa, geolocalización, reportes…)
- `views/` — páginas y componentes de interfaz
- `collections/` — modelos de datos de Payload
- `app/` — rutas de Next.js (páginas y API)

## Ejecutar
```bash
pnpm install
cp .env.example .env.local   # completa DATABASE_URL y PAYLOAD_SECRET
pnpm dev
```

## Datos de demostración y pruebas
```bash
pnpm seed          # catálogos + 10 usuarios de demostración con 2–4 reportes cada uno (idempotente)
pnpm test          # pruebas unitarias y de API (necesita `pnpm dev` en marcha)
pnpm verify:demo   # verifica en la base de datos y limpia las cuentas de la suite
```
Los usuarios de demostración usan correos `@demo.rutasegura.test` y las contraseñas `Demo2026#01` a `Demo2026#10`.
Todos sus datos están marcados con `isDemo` y **no son reportes reales de seguridad ciudadana**.

## Categorías de reporte
Acoso callejero · Robo o intento de robo · Violencia o agresión · Zona oscura o con poca iluminación · Zona solitaria o de riesgo
(fuente única: `src/models/categories.ts`).

## Mapa
Pide la ubicación del dispositivo al entrar (requiere HTTPS o localhost) y muestra los reportes aprobados a menos de 5 km, del más cercano al más lejano. La API admite `/api/community-reports?lat=&lon=&radius_km=`.
