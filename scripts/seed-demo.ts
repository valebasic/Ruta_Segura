/**
 * Seed de datos DE DEMOSTRACIÓN para Ruta Segura.
 *
 *   pnpm seed
 *
 * - Crea los catálogos (8 municipios y las 5 categorías) si faltan.
 * - Crea 10 usuarios de demostración (@demo.rutasegura.test) con 2 a 4 reportes cada uno.
 * - Es idempotente: se puede ejecutar varias veces sin duplicar usuarios ni reportes.
 * - Todo queda marcado con `isDemo: true`. NO son reportes reales de seguridad ciudadana.
 * - Las contraseñas las cifra Payload (hash + sal); nunca se guardan en texto plano.
 */
import config from '../src/payload.config'
import { getPayload } from 'payload'
import { REPORT_CATEGORIES, type Category } from '../src/models/categories'

export const DEMO_DOMAIN = 'demo.rutasegura.test'

type Place = { sector: string; lat: number; lon: number }

// Sectores de Facatativá (coordenadas aproximadas, solo para pruebas).
const PLACES: Place[] = [
  { sector: 'Centro, parque principal', lat: 4.8143, lon: -74.3545 },
  { sector: 'Terminal de transporte', lat: 4.809, lon: -74.359 },
  { sector: 'Estación del tren', lat: 4.816, lon: -74.35 },
  { sector: 'Calle 15 con carrera 5', lat: 4.817, lon: -74.357 },
  { sector: 'Barrio Manablanca', lat: 4.824, lon: -74.346 },
  { sector: 'Sector industrial occidental', lat: 4.812, lon: -74.368 },
  { sector: 'Alrededores de la universidad', lat: 4.819, lon: -74.363 },
  { sector: 'Sector La Pradera', lat: 4.802, lon: -74.35 },
  { sector: 'Barrio San Rafael', lat: 4.807, lon: -74.344 },
  { sector: 'Ronda del río Botello', lat: 4.82, lon: -74.3395 },
  { sector: 'Barrio Santa Rita', lat: 4.811, lon: -74.361 },
  { sector: 'Salida hacia Madrid', lat: 4.8185, lon: -74.33 },
  { sector: 'Vereda Pueblo Viejo', lat: 4.86, lon: -74.32 },
  { sector: 'Sector Cartagenita alto', lat: 4.805, lon: -74.33 },
  { sector: 'Parque lineal norte', lat: 4.8225, lon: -74.3525 },
  { sector: 'Barrio El Corzo', lat: 4.8135, lon: -74.3445 },
  { sector: 'Puente peatonal vía férrea', lat: 4.8152, lon: -74.3478 },
  { sector: 'Mercado y plaza de ferias', lat: 4.8105, lon: -74.3525 },
  { sector: 'Sector Tierra Grata', lat: 4.8265, lon: -74.3585 },
  { sector: 'Barrio Los Alcázares', lat: 4.8035, lon: -74.3615 },
  { sector: 'Variante hacia Zipacón', lat: 4.7925, lon: -74.3715 },
  { sector: 'Barrio Bochica', lat: 4.8095, lon: -74.3395 },
  { sector: 'Calle 8 con carrera 2', lat: 4.8128, lon: -74.3562 },
  { sector: 'Barrio La Esperanza', lat: 4.8205, lon: -74.3705 },
  { sector: 'Zona de potreros oriental', lat: 4.8075, lon: -74.3235 },
  { sector: 'Sector Cuatro Esquinas', lat: 4.8175, lon: -74.3415 },
  { sector: 'Barrio Paraíso', lat: 4.8255, lon: -74.3495 },
  { sector: 'Antiguo camino real', lat: 4.8305, lon: -74.3665 },
  { sector: 'Barrio Santa Marta', lat: 4.8015, lon: -74.3395 },
  { sector: 'Zona de bodegas', lat: 4.8195, lon: -74.3785 },
  { sector: 'Paradero de buses sur', lat: 4.7985, lon: -74.3555 },
  { sector: 'Cancha comunal San José', lat: 4.8275, lon: -74.3395 },
]

const DESCRIPTIONS: Record<Category, string[]> = {
  'Acoso callejero': [
    'Grupo de hombres que dicen comentarios y silban a quienes pasan, sobre todo al salir del trabajo.',
    'Se reportan piropos insistentes y seguimientos a mujeres que caminan solas por este tramo.',
    'Hombres en moto que reducen la velocidad para gritar cosas a las transeúntes.',
    'Acoso verbal frecuente en este punto, especialmente en horas de la tarde.',
    'Persona que sigue a las mujeres desde la salida del colegio hasta varias cuadras.',
    'Comentarios ofensivos desde un establecimiento al pasar por el andén.',
  ],
  'Robo o intento de robo': [
    'Intentaron arrebatar un celular a una persona que caminaba distraída en la noche.',
    'Se han presentado hurtos de bolsos en este sector a la hora pico.',
    'Dos personas en moto abordan a quienes van a pie para quitarles sus pertenencias.',
    'Raponazo de cadena reportado por varias personas en la misma semana.',
    'Intento de robo a una mujer que esperaba el bus; alcanzó a pedir ayuda.',
    'Robo de mochilas en este sector, sobre todo los fines de semana.',
  ],
  'Violencia o agresión': [
    'Riña entre varias personas en la vía pública durante la noche; hubo golpes.',
    'Se escuchan gritos y agresiones constantes en una vivienda cercana; los vecinos están preocupados.',
    'Agresión a una mujer por parte de un desconocido en la vía; intervinieron transeúntes.',
    'Peleas frecuentes los fines de semana en horas de la noche, con gritos y golpes.',
    'Persona que amenazó con un objeto cortopunzante a quienes pasaban.',
    'Discusión violenta en plena calle que terminó en agresión física.',
  ],
  'Zona oscura o con poca iluminación': [
    'Varias lámparas del alumbrado público están dañadas y el tramo queda en total oscuridad.',
    'Calle sin iluminación después de las 6 de la tarde; se siente inseguro caminar.',
    'Los postes de esta zona llevan semanas sin luz y de noche no se ve nada.',
    'Tramo peatonal sin luminarias, muy oscuro durante la noche.',
    'Andén con árboles que tapan la luz de los postes; casi no se ve el camino.',
    'Falta alumbrado en toda la cuadra y hay ruidos extraños por las noches.',
  ],
  'Zona solitaria o de riesgo': [
    'Lote enmontado sin tránsito de personas; da temor atravesarlo en solitario.',
    'Camino poco transitado entre dos barrios, sin casas ni comercio abierto.',
    'Esta zona queda desierta al caer la tarde y casi no pasa nadie.',
    'Tramo largo sin viviendas ni locales; si pasa algo no hay a quién pedir ayuda.',
    'Tramo con maleza alta y muy poca gente a ciertas horas.',
    'Espacio abandonado donde se reúnen personas ajenas al sector por la noche.',
  ],
}

type DemoUser = { name: string; email: string; password: string; reports: number }

export const DEMO_USERS: DemoUser[] = [
  { name: 'Valentina Rojas', email: `valentina.rojas@${DEMO_DOMAIN}`, password: 'Demo2026#01', reports: 3 },
  { name: 'Camila Torres', email: `camila.torres@${DEMO_DOMAIN}`, password: 'Demo2026#02', reports: 2 },
  { name: 'Laura Gómez', email: `laura.gomez@${DEMO_DOMAIN}`, password: 'Demo2026#03', reports: 4 },
  { name: 'Mariana Pérez', email: `mariana.perez@${DEMO_DOMAIN}`, password: 'Demo2026#04', reports: 3 },
  { name: 'Daniela Castro', email: `daniela.castro@${DEMO_DOMAIN}`, password: 'Demo2026#05', reports: 2 },
  { name: 'Sofía Ramírez', email: `sofia.ramirez@${DEMO_DOMAIN}`, password: 'Demo2026#06', reports: 3 },
  { name: 'Juliana Moreno', email: `juliana.moreno@${DEMO_DOMAIN}`, password: 'Demo2026#07', reports: 4 },
  { name: 'Paula Herrera', email: `paula.herrera@${DEMO_DOMAIN}`, password: 'Demo2026#08', reports: 2 },
  { name: 'Natalia Vargas', email: `natalia.vargas@${DEMO_DOMAIN}`, password: 'Demo2026#09', reports: 3 },
  { name: 'Andrea Quintero', email: `andrea.quintero@${DEMO_DOMAIN}`, password: 'Demo2026#10', reports: 3 },
]

const MUNICIPALITIES = [
  'Facatativá',
  'Madrid',
  'Mosquera',
  'Funza',
  'Bojacá',
  'Zipacón',
  'El Rosal',
  'Subachoque',
]

async function main() {
  const payload = await getPayload({ config })

  // 1. Catálogos
  const ids = { municipalities: new Map<string, number>(), categories: new Map<string, number>() }
  for (const name of MUNICIPALITIES) {
    const found = await payload.find({ collection: 'municipalities', where: { name: { equals: name } }, limit: 1, overrideAccess: true })
    const doc = found.docs[0] ?? (await payload.create({ collection: 'municipalities', data: { name }, overrideAccess: true }))
    ids.municipalities.set(name, doc.id)
  }
  for (const name of REPORT_CATEGORIES) {
    const found = await payload.find({ collection: 'risk-categories', where: { name: { equals: name } }, limit: 1, overrideAccess: true })
    const doc = found.docs[0] ?? (await payload.create({ collection: 'risk-categories', data: { name }, overrideAccess: true }))
    ids.categories.set(name, doc.id)
  }
  const facatativa = ids.municipalities.get('Facatativá')!

  // 2. Usuarios y reportes de demostración
  let placeIndex = 0
  let reportCounter = 0
  let createdUsers = 0
  let createdReports = 0

  for (const [userIndex, demo] of DEMO_USERS.entries()) {
    const existing = await payload.find({ collection: 'users', where: { email: { equals: demo.email } }, limit: 1, overrideAccess: true })
    let user = existing.docs[0]
    if (!user) {
      user = await payload.create({
        collection: 'users',
        overrideAccess: true,
        data: { email: demo.email, password: demo.password, name: demo.name, role: 'community', isDemo: true },
      })
      createdUsers++
    }

    for (let r = 0; r < demo.reports; r++) {
      // Reparte categorías y sectores de forma determinista (mismos datos en cada ejecución).
      const category = REPORT_CATEGORIES[(userIndex + r * 2) % REPORT_CATEGORIES.length]
      const place = PLACES[placeIndex % PLACES.length]
      placeIndex++
      const options = DESCRIPTIONS[category]
      const description = `${options[(userIndex + r) % options.length]} [Dato de demostración]`
      reportCounter++

      // Clave de idempotencia: dueño + coordenadas (cada reporte de demostración tiene las suyas).
      const already = await payload.find({
        collection: 'reports',
        where: {
          and: [
            { owner: { equals: user.id } },
            { latitude: { equals: place.lat } },
            { longitude: { equals: place.lon } },
          ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (already.docs[0]) {
        if (already.docs[0].description !== description)
          await payload.update({
            collection: 'reports',
            id: already.docs[0].id,
            data: { description },
            overrideAccess: true,
          })
        continue
      }

      // Fechas y horas variadas (entre hoy y hace ~3 semanas, en horario de 6:00 a 22:00).
      const when = new Date()
      when.setDate(when.getDate() - ((reportCounter * 3) % 21))
      when.setHours(6 + ((reportCounter * 5) % 17), (reportCounter * 7) % 60, 0, 0)

      await payload.create({
        collection: 'reports',
        draft: false,
        overrideAccess: true,
        data: {
          latitude: place.lat,
          longitude: place.lon,
          address: `${place.sector}, Facatativá, Cundinamarca (ubicación aproximada de demostración)`,
          referencePoint: place.sector,
          municipality: facatativa,
          category: ids.categories.get(category)!,
          description,
          locationSource: 'manual',
          status: 'approved',
          isDemo: true,
          owner: user.id,
          createdAt: when.toISOString(),
        },
      })
      createdReports++
    }
  }

  console.log(`Seed listo. Usuarios nuevos: ${createdUsers}. Reportes nuevos: ${createdReports}.`)
  console.log('\n| # | Nombre | Correo | Contraseña de prueba | Reportes |')
  console.log('|---|--------|--------|----------------------|----------|')
  DEMO_USERS.forEach((u, i) =>
    console.log(`| ${i + 1} | ${u.name} | ${u.email} | ${u.password} | ${u.reports} |`),
  )
  process.exit(0)
}

try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
