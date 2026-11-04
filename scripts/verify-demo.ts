/**
 * Verifica en la base de datos real (no en el frontend):
 *  - 10 usuarios de demostración, cada uno con 2 a 4 reportes propios
 *  - catálogo con exactamente las 5 categorías
 *  - contraseñas cifradas (nunca en texto plano)
 *  - los reportes de la suite de pruebas (pnpm test) pertenecen a su usuario
 * y limpia las cuentas/reportes `test.auto.*` que dejó la suite.
 *
 *   pnpm verify:demo
 */
import config from '../src/payload.config'
import { getPayload } from 'payload'
import { REPORT_CATEGORIES } from '../src/models/categories'

const payload = await getPayload({ config })
let failures = 0
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✔' : '✘'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

// Catálogo
const cats = await payload.find({ collection: 'risk-categories', limit: 50, overrideAccess: true })
const names = cats.docs.map((c) => c.name).sort()
check(
  JSON.stringify(names) === JSON.stringify([...REPORT_CATEGORIES].sort()),
  'El catálogo tiene exactamente las 5 categorías',
  names.join(' | '),
)

// Usuarios de demostración
const users = await payload.find({
  collection: 'users',
  where: { isDemo: { equals: true } },
  limit: 100,
  overrideAccess: true,
})
check(users.totalDocs === 10, 'Existen exactamente 10 usuarios de demostración', `hay ${users.totalDocs}`)
check(
  new Set(users.docs.map((u) => u.email)).size === users.docs.length &&
    new Set(users.docs.map((u) => u.name)).size === users.docs.length,
  'Nombres y correos únicos',
)

let total = 0
const coordinates = new Set<string>()
const categoriesUsed = new Set<string>()
for (const user of users.docs) {
  // Solo se cuentan los reportes de demostración; si alguien probó la app con esta cuenta y
  // creó reportes reales, se respetan y se informan aparte.
  const reports = await payload.find({
    collection: 'reports',
    where: { and: [{ owner: { equals: user.id } }, { isDemo: { equals: true } }] },
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })
  const extra = await payload.count({
    collection: 'reports',
    where: { and: [{ owner: { equals: user.id } }, { isDemo: { not_equals: true } }] },
    overrideAccess: true,
  })
  if (extra.totalDocs) console.log(`ℹ ${user.name}: además tiene ${extra.totalDocs} reporte(s) creado(s) manualmente (no se tocan)`)
  total += reports.totalDocs
  const ok =
    reports.totalDocs >= 2 &&
    reports.totalDocs <= 4 &&
    reports.docs.every((r) => {
      const owner = typeof r.owner === 'object' ? r.owner.id : r.owner
      return owner === user.id && r.isDemo === true && r.status === 'approved'
    })
  check(ok, `${user.name}: ${reports.totalDocs} reportes propios`)
  for (const r of reports.docs) {
    coordinates.add(`${r.latitude},${r.longitude}`)
    if (typeof r.category === 'object') categoriesUsed.add(r.category.name)
    const valid =
      Number.isFinite(r.latitude) &&
      Number.isFinite(r.longitude) &&
      !Number.isNaN(Date.parse(r.createdAt)) &&
      r.description.length >= 10
    if (!valid) check(false, `Reporte ${r.id} con datos inválidos`)
  }
}
check(coordinates.size === total, 'Ninguna coordenada se repite', `${coordinates.size}/${total}`)
check(categoriesUsed.size === 5, 'Los reportes cubren las 5 categorías', `${categoriesUsed.size}/5`)

// Contraseñas cifradas
const pool = (payload.db as unknown as { pool: { query: (q: string) => Promise<{ rows: { hash: string; salt: string; email: string }[] }> } }).pool
const secrets = await pool.query('select email, hash, salt from users')
const plain = secrets.rows.filter((r) => !r.hash || r.hash.length < 60 || !r.salt || /^Demo2026#/.test(r.hash))
check(plain.length === 0, 'Todas las contraseñas están cifradas (hash + sal)', `${secrets.rows.length} cuentas revisadas`)

// Limpieza de la suite de pruebas
const tests = await payload.find({
  collection: 'users',
  where: { email: { like: 'test.auto.' } },
  limit: 100,
  overrideAccess: true,
})
for (const u of tests.docs) {
  const reports = await payload.find({
    collection: 'reports',
    where: { owner: { equals: u.id } },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const own = reports.docs.every((r) => r.owner === u.id && r.status === 'approved')
  check(
    own,
    `Cuenta de pruebas ${u.email}: ${reports.totalDocs} reporte(s), todos de su dueño y publicados`,
  )
  await payload.delete({ collection: 'reports', where: { owner: { equals: u.id } }, overrideAccess: true })
  await payload.delete({ collection: 'users', id: u.id, overrideAccess: true })
}
if (tests.docs.length) console.log(`(limpiadas ${tests.docs.length} cuentas de la suite de pruebas)`)

console.log(failures ? `\n${failures} verificación(es) fallaron` : '\nTodo correcto')
process.exit(failures ? 1 : 0)
