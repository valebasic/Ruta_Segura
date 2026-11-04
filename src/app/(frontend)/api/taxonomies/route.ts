import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET() {
  const payload = await getPayload({ config })
  const [municipalities, categories] = await Promise.all([
    payload.find({ collection: 'municipalities', limit: 100, sort: 'name', overrideAccess: false }),
    payload.find({ collection: 'risk-categories', limit: 20, sort: 'name', overrideAccess: false }),
  ])
  return Response.json({
    municipalities: municipalities.docs.map((item) => ({ id: item.id, name: item.name })),
    categories: categories.docs.map((item) => ({ id: item.id, name: item.name })),
  })
}
