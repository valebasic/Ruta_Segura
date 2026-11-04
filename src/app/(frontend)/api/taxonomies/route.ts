import config from '@payload-config'
import { getPayload } from 'payload'
import { REPORT_CATEGORIES } from '@/models/categories'

export async function GET() {
  const payload = await getPayload({ config })
  const [municipalities, categories] = await Promise.all([
    payload.find({ collection: 'municipalities', limit: 100, sort: 'name', overrideAccess: false }),
    payload.find({
      collection: 'risk-categories',
      limit: 50,
      overrideAccess: false,
      where: { name: { in: [...REPORT_CATEGORIES] } },
    }),
  ])
  // Solo las 5 categorías vigentes, en el orden oficial.
  const order = (name: string) => REPORT_CATEGORIES.indexOf(name as (typeof REPORT_CATEGORIES)[number])
  return Response.json({
    municipalities: municipalities.docs.map((item) => ({ id: item.id, name: item.name })),
    categories: categories.docs
      .map((item) => ({ id: item.id, name: item.name }))
      .sort((a, b) => order(a.name) - order(b.name)),
  })
}
