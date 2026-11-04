import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionConfig,
  FieldAccess,
  Where,
} from 'payload'

const isAppUser = (
  user: unknown,
): user is { id: string | number; collection: 'users'; role?: string } =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'users')

const isModerator = (user: unknown) => isAppUser(user) && user.role === 'moderator'

const readReports: Access = ({ req }) => {
  if (req.user?.collection === 'admins' || isModerator(req.user)) return true
  if (isAppUser(req.user)) {
    const ownedOrApproved: Where = {
      or: [{ status: { equals: 'approved' } }, { owner: { equals: req.user.id } }],
    }
    return ownedOrApproved
  }
  return { status: { equals: 'approved' } }
}

const moderatorOnly: Access = ({ req }) =>
  req.user?.collection === 'admins' || isModerator(req.user)

// Cada persona puede borrar solo sus propios reportes; moderación y administración, cualquiera.
const deleteOwnOrModerator: Access = ({ req }) => {
  if (req.user?.collection === 'admins' || isModerator(req.user)) return true
  if (isAppUser(req.user)) return { owner: { equals: req.user.id } }
  return false
}

const protectedField: FieldAccess = ({ req }) =>
  req.user?.collection === 'admins' || isModerator(req.user)

const assignOwnerAndWorkflow: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create') return data
  if (!isAppUser(req.user)) return data
  return {
    ...data,
    owner: req.user.id,
    status: 'approved',
  }
}

export const Reports: CollectionConfig = {
  slug: 'reports',
  admin: {
    group: 'Ruta Segura',
    useAsTitle: 'referencePoint',
    defaultColumns: ['referencePoint', 'municipality', 'category', 'status', 'createdAt'],
  },
  access: {
    create: ({ req }) => isAppUser(req.user),
    delete: deleteOwnOrModerator,
    read: readReports,
    update: moderatorOnly,
  },
  hooks: {
    beforeChange: [assignOwnerAndWorkflow],
  },
  fields: [
    {
      name: 'latitude',
      type: 'number',
      required: true,
      min: -90,
      max: 90,
    },
    {
      name: 'longitude',
      type: 'number',
      required: true,
      min: -180,
      max: 180,
    },
    {
      name: 'accuracyM',
      label: 'Precisión GPS (m)',
      type: 'number',
      min: 0,
    },
    {
      name: 'address',
      type: 'text',
    },
    {
      name: 'referencePoint',
      type: 'text',
      required: true,
      maxLength: 160,
    },
    {
      name: 'municipality',
      type: 'relationship',
      relationTo: 'municipalities',
      required: true,
      index: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'risk-categories',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      minLength: 10,
      maxLength: 280,
    },
    {
      name: 'locationSource',
      type: 'select',
      required: true,
      options: [
        { label: 'GPS', value: 'gps' },
        { label: 'Selección manual', value: 'manual' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'approved',
      index: true,
      options: [
        { label: 'PENDIENTE', value: 'pending' },
        { label: 'APROBADO', value: 'approved' },
        { label: 'RECHAZADO', value: 'rejected' },
        { label: 'OCULTO', value: 'hidden' },
      ],
      access: {
        create: protectedField,
        update: protectedField,
      },
    },
    {
      name: 'isDemo',
      label: 'Dato de demostración',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Reporte de prueba generado por el seed. No es seguridad ciudadana real.',
      },
      access: {
        create: protectedField,
        update: protectedField,
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
      access: {
        create: protectedField,
        update: protectedField,
      },
    },
  ],
}
