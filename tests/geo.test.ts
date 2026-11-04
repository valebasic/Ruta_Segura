import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isCategory, REPORT_CATEGORIES } from '../src/models/categories.ts'
import { boundingBox, formatDistance, haversineKm } from '../src/models/geo.ts'

const FACATATIVA = { latitude: 4.8143, longitude: -74.3545 }

test('haversine: mismo punto = 0 km', () => {
  assert.equal(haversineKm(FACATATIVA, FACATATIVA), 0)
})

test('haversine: 1 grado de latitud ≈ 111,2 km', () => {
  const km = haversineKm({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 })
  assert.ok(Math.abs(km - 111.19) < 0.2, `km=${km}`)
})

test('haversine: Facatativá–Madrid (Cundinamarca) está entre 10 y 16 km', () => {
  const km = haversineKm(FACATATIVA, { latitude: 4.7329, longitude: -74.265 })
  assert.ok(km > 10 && km < 16, `km=${km}`)
})

test('haversine es simétrica', () => {
  const b = { latitude: 4.86, longitude: -74.32 }
  assert.ok(Math.abs(haversineKm(FACATATIVA, b) - haversineKm(b, FACATATIVA)) < 1e-9)
})

test('el rectángulo de búsqueda contiene todo punto dentro del radio', () => {
  const box = boundingBox(FACATATIVA.latitude, FACATATIVA.longitude, 5)
  const p = { latitude: 4.8143 + 0.031, longitude: -74.3545 + 0.031 }
  assert.ok(haversineKm(FACATATIVA, p) <= 5)
  assert.ok(p.latitude >= box.minLat && p.latitude <= box.maxLat)
  assert.ok(p.longitude >= box.minLon && p.longitude <= box.maxLon)
})

test('formatDistance', () => {
  assert.equal(formatDistance(0.43), '430 m')
  assert.equal(formatDistance(1.26), '1,3 km')
  assert.equal(formatDistance(12), '12,0 km')
})

test('existen exactamente 5 categorías, sin duplicados', () => {
  assert.equal(REPORT_CATEGORIES.length, 5)
  assert.equal(new Set(REPORT_CATEGORIES).size, 5)
  assert.deepEqual(
    [...REPORT_CATEGORIES],
    [
      'Acoso callejero',
      'Robo o intento de robo',
      'Violencia o agresión',
      'Zona oscura o con poca iluminación',
      'Zona solitaria o de riesgo',
    ],
  )
})

test('isCategory rechaza las categorías anteriores', () => {
  for (const old of ['ACOSO', 'ILUMINACIÓN DEFICIENTE', 'ZONA DESOLADA', '', null, 5])
    assert.equal(isCategory(old), false)
  for (const name of REPORT_CATEGORIES) assert.equal(isCategory(name), true)
})
