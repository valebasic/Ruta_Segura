import type { Access, CollectionConfig } from 'payload'

const canManage: Access = ({ req }) =>
  req.user?.collection === 'admins' ||
  (req.user?.collection === 'users' && req.user.role === 'moderator')

export const RiskCategories: CollectionConfig = {
  slug: 'risk-categories',
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
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'ACOSO', value: 'ACOSO' },
        { label: 'ILUMINACIÓN DEFICIENTE', value: 'ILUMINACIÓN DEFICIENTE' },
        { label: 'ZONA DESOLADA', value: 'ZONA DESOLADA' },
      ],
    },
  ],
}
