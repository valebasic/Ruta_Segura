import type { Access, CollectionConfig } from 'payload'

const canManage: Access = ({ req }) =>
  req.user?.collection === 'admins' ||
  (req.user?.collection === 'users' && req.user.role === 'moderator')

export const Municipalities: CollectionConfig = {
  slug: 'municipalities',
  admin: {
    group: 'Ruta Segura',
    useAsTitle: 'name',
  },
  access: {
    create: canManage,
    delete: canManage,
    read: () => true,
    update: canManage,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
  ],
}
