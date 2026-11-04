/**
 * Pruebas de integración contra el servidor en marcha (pnpm dev).
 *   BASE_URL=http://localhost:3000 pnpm test
 * Crean una cuenta `test.auto.*` y reportes marcados con [prueba-automatizada];
 * `pnpm verify:demo` los verifica en la base de datos y los limpia.
 */
import assert from 'node:assert/strict'
import { after, describe, test } from 'node:test'
import { REPORT_CATEGORIES } from '../src/models/categories.ts'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const PASSWORD = 'PruebaAuto#2026'
const stamp = Date.now()
const email = `test.auto.${stamp}@example.com`
const MARK = '[prueba-automatizada]'

type Json = Record<string, any>
const call = async (path: string, init: RequestInit & { cookie?: string } = {}) => {
  const { cookie, ...rest } = init
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
  })
  const body: Json = await res.json().catch(() => ({}))
  return { res, body }
}
const post = (path: string, data: unknown, cookie?: string) =>
  call(path, { method: 'POST', body: JSON.stringify(data), cookie })
const cookieOf = (res: Response) =>
  res.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .filter((c) => !c.endsWith('='))
    .join('; ')

let session = ''
let taxonomy: {
  municipalities: { id: number; name: string }[]
  categories: { id: number; name: string }[]
}

describe('Autenticación', () => {
  test('registra un usuario nuevo', async () => {
    const { res } = await post('/api/app-auth/register', { email, password: PASSWORD })
    assert.equal(res.status, 201)
  })
  test('rechaza un correo ya registrado', async () => {
    const { res, body } = await post('/api/app-auth/register', { email, password: PASSWORD })
    assert.equal(res.status, 409)
    assert.match(body.error, /ya está registrado/)
  })
  test('rechaza correo inválido, contraseña corta y datos vacíos', async () => {
    const bad = [
      { email: 'no-es-correo', password: PASSWORD },
      { email: `x${stamp}@example.com`, password: '123' },
      {},
    ]
    for (const data of bad) assert.equal((await post('/api/app-auth/register', data)).res.status, 400)
  })
  test('rechaza contraseña incorrecta', async () => {
    const { res, body } = await post('/api/app-auth/login', { email, password: 'incorrecta123' })
    assert.equal(res.status, 401)
    assert.match(body.error, /Credenciales/)
  })
  test('rechaza un correo que no existe', async () => {
    const { res } = await post('/api/app-auth/login', {
      email: `nadie${stamp}@example.com`,
      password: PASSWORD,
    })
    assert.equal(res.status, 401)
  })
  test('inicia sesión y mantiene la sesión', async () => {
    const { res, body } = await post('/api/app-auth/login', { email, password: PASSWORD })
    assert.equal(res.status, 200)
    assert.equal(body.user.email, email)
    session = cookieOf(res)
    assert.ok(session.includes('app-session='))
    const me = await call('/api/app-auth/me', { cookie: session })
    assert.equal(me.res.status, 200)
    assert.equal(me.body.user.email, email)
  })
  test('sin sesión /me responde 401', async () => {
    assert.equal((await call('/api/app-auth/me')).res.status, 401)
  })
})

describe('Categorías', () => {
  test('la API ofrece exactamente las 5 categorías', async () => {
    const { body } = await call('/api/taxonomies')
    taxonomy = body as typeof taxonomy
    assert.deepEqual(
      taxonomy.categories.map((c) => c.name),
      [...REPORT_CATEGORIES],
    )
    assert.ok(taxonomy.municipalities.some((m) => m.name === 'Facatativá'))
  })
})

describe('Reportes', () => {
  const valid = () => ({
    latitude: 4.8143,
    longitude: -74.3545,
    accuracy_m: 12,
    address: 'Prueba automatizada',
    municipality_id: taxonomy.municipalities.find((m) => m.name === 'Facatativá')!.id,
    category_id: taxonomy.categories[0].id,
    description: `Reporte de prueba creado por la suite ${stamp} ${MARK}`,
    location_source: 'manual',
    reference_point: 'Parque Santander',
  })
  const status = async (data: unknown, cookie = session) =>
    (await post('/api/community-reports', data, cookie)).res.status

  test('sin sesión no se puede crear un reporte', async () => {
    assert.equal(await status(valid(), ''), 401)
  })
  test('rechaza reportes vacíos o incompletos', async () => {
    assert.equal(await status({}), 400)
    assert.equal(await status({ ...valid(), description: 'corta' }), 400)
    assert.equal(await status({ ...valid(), latitude: 999 }), 400)
    assert.equal(await status({ ...valid(), category_id: undefined }), 400)
    assert.equal(await status({ ...valid(), reference_point: '' }), 400)
  })
  test('rechaza una categoría que no existe', async () => {
    assert.equal(await status({ ...valid(), category_id: 99999999 }), 400)
  })
  test('crea un reporte con cada una de las 5 categorías', async () => {
    for (const [i, category] of taxonomy.categories.entries()) {
      const data = {
        ...valid(),
        category_id: category.id,
        latitude: 4.8143 + i * 0.0005,
        description: `${category.name}: prueba ${stamp} ${MARK}`,
      }
      const { res, body } = await post('/api/community-reports', data, session)
      assert.equal(res.status, 201, JSON.stringify(body))
      assert.equal(body.report.status, 'approved')
    }
  })
  test('el doble clic no duplica el reporte', async () => {
    const data = { ...valid(), latitude: 4.8199, description: `Doble envío ${stamp} ${MARK}` }
    const first = await post('/api/community-reports', data, session)
    assert.equal(first.res.status, 201)
    const again = await post('/api/community-reports', data, session)
    assert.equal(again.res.status, 200)
    assert.equal(again.body.duplicate, true)
    assert.equal(again.body.report.id, first.body.report.id)
  })
  test('un reporte nuevo se publica al instante y lo ve cualquier persona', async () => {
    // Consulta anónima: sin sesión ni moderación de por medio.
    const { body } = await call('/api/community-reports')
    const published = body.reports.filter((r: Json) => String(r.description).includes(MARK))
    assert.ok(published.length >= 6, `esperaba ≥6 reportes publicados, hay ${published.length}`)
    assert.ok(published.every((r: Json) => r.status === 'approved'))
  })
})

describe('Mis reportes', () => {
  const emailB = `test.auto.${stamp}.b@example.com`
  let sessionB = ''
  let reportId: number

  test('sin sesión no se pueden ver ni borrar reportes', async () => {
    assert.equal((await call('/api/my-reports')).res.status, 401)
    assert.equal(
      (await call('/api/my-reports', { method: 'DELETE', body: JSON.stringify({ id: 1 }) })).res.status,
      401,
    )
  })

  test('lista los reportes propios', async () => {
    const { res, body } = await call('/api/my-reports', { cookie: session })
    assert.equal(res.status, 200)
    const rows: Json[] = body.reports
    assert.ok(rows.length >= 6, `esperaba al menos 6, hay ${rows.length}`)
    assert.ok(rows.every((r) => r.status === 'approved'))
    assert.ok(rows.every((r) => String(r.description).includes(MARK)))
    reportId = rows[0].id
  })

  test('cada persona ve solo lo suyo', async () => {
    assert.equal((await post('/api/app-auth/register', { email: emailB, password: PASSWORD })).res.status, 201)
    const login = await post('/api/app-auth/login', { email: emailB, password: PASSWORD })
    sessionB = cookieOf(login.res)
    const { body } = await call('/api/my-reports', { cookie: sessionB })
    assert.deepEqual(body.reports, [])
  })

  test('otra persona no puede eliminar un reporte ajeno', async () => {
    const out = await call('/api/my-reports', {
      method: 'DELETE',
      body: JSON.stringify({ id: reportId }),
      cookie: sessionB,
    })
    assert.equal(out.res.status, 404)
    const mine = await call('/api/my-reports', { cookie: session })
    assert.ok(mine.body.reports.some((r: Json) => r.id === reportId), 'el reporte debe seguir existiendo')
  })

  test('rechaza ids inválidos', async () => {
    for (const id of [undefined, null, {}, []])
      assert.equal(
        (await call('/api/my-reports', { method: 'DELETE', body: JSON.stringify({ id }), cookie: session })).res.status,
        400,
      )
    assert.equal(
      (await call('/api/my-reports', { method: 'DELETE', body: JSON.stringify({ id: 99999999 }), cookie: session })).res.status,
      404,
    )
  })

  test('la persona dueña elimina su reporte', async () => {
    const before = (await call('/api/my-reports', { cookie: session })).body.reports.length
    const out = await call('/api/my-reports', {
      method: 'DELETE',
      body: JSON.stringify({ id: reportId }),
      cookie: session,
    })
    assert.equal(out.res.status, 200)
    const after = await call('/api/my-reports', { cookie: session })
    assert.equal(after.body.reports.length, before - 1)
    assert.ok(!after.body.reports.some((r: Json) => r.id === reportId))
    // Borrarlo otra vez ya no lo encuentra
    const again = await call('/api/my-reports', {
      method: 'DELETE',
      body: JSON.stringify({ id: reportId }),
      cookie: session,
    })
    assert.equal(again.res.status, 404)
  })
})

describe('Reportes cercanos (datos de demostración)', () => {
  const origin = 'lat=4.8143&lon=-74.3545'
  const count = async (km: number) =>
    (await call(`/api/community-reports?${origin}&radius_km=${km}`)).body.reports.length as number

  test('devuelve reportes dentro de 5 km, ordenados por distancia', async () => {
    const { res, body } = await call(`/api/community-reports?${origin}&radius_km=5`)
    assert.equal(res.status, 200)
    const rows: Json[] = body.reports
    assert.ok(rows.length > 0, 'debería haber reportes cercanos (ejecuta pnpm seed)')
    for (const row of rows) assert.ok(row.distance_km <= 5, `fuera del radio: ${row.distance_km}`)
    const distances = rows.map((r) => r.distance_km as number)
    assert.deepEqual(
      distances,
      [...distances].sort((a, b) => a - b),
    )
    assert.deepEqual(body.origin, { latitude: 4.8143, longitude: -74.3545, radius_km: 5 })
  })
  test('el radio por defecto es 5 km', async () => {
    const withDefault = await call(`/api/community-reports?${origin}`)
    assert.equal(withDefault.body.reports.length, await count(5))
  })
  test('un radio mayor incluye más reportes y uno menor, menos', async () => {
    const [r1, r5, r10] = [await count(1), await count(5), await count(10)]
    assert.ok(r1 < r5, `1 km (${r1}) debería tener menos que 5 km (${r5})`)
    assert.ok(r5 < r10, `5 km (${r5}) debería tener menos que 10 km (${r10})`)
  })
  test('lejos de cualquier reporte no hay resultados', async () => {
    const { res, body } = await call('/api/community-reports?lat=10&lon=-70&radius_km=5')
    assert.equal(res.status, 200)
    assert.deepEqual(body.reports, [])
  })
  test('valida la ubicación y el radio', async () => {
    assert.equal((await call('/api/community-reports?lat=abc&lon=1')).res.status, 400)
    assert.equal((await call('/api/community-reports?lat=95&lon=1')).res.status, 400)
    assert.equal((await call('/api/community-reports?lat=4.8')).res.status, 400)
    assert.equal((await call(`/api/community-reports?${origin}&radius_km=-3`)).res.status, 400)
  })
  test('los reportes usan solo las 5 categorías', async () => {
    const { body } = await call('/api/community-reports')
    for (const r of body.reports)
      assert.ok((REPORT_CATEGORIES as readonly string[]).includes(r.category), r.category)
  })
})

describe('Usuarios de demostración', () => {
  test('pueden iniciar sesión', async () => {
    const accounts: [string, string][] = [
      ['valentina.rojas', 'Demo2026#01'],
      ['daniela.castro', 'Demo2026#05'],
      ['andrea.quintero', 'Demo2026#10'],
    ]
    for (const [handle, password] of accounts) {
      const { res } = await post('/api/app-auth/login', {
        email: `${handle}@demo.rutasegura.test`,
        password,
      })
      assert.equal(res.status, 200, handle)
    }
  })
})

describe('Cierre de sesión', () => {
  test('cierra la sesión', async () => {
    const out = await call('/api/app-auth/logout', { method: 'POST', cookie: session })
    assert.equal(out.res.status, 200)
    assert.match(out.res.headers.getSetCookie().join(';'), /app-session=;/)
    assert.equal((await call('/api/app-auth/me')).res.status, 401)
  })
})

after(() => {
  console.log(`\nCuenta de prueba: ${email} (la limpia "pnpm verify:demo")`)
})
