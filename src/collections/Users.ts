import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isUser = (
  user: unknown,
): user is { id: string | number; collection: 'users'; role?: string } =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'users')

const isModerator = (user: unknown) => isUser(user) && user.role === 'moderator'

const readOwnOrModerator: Access = ({ req }) => {
  if (isModerator(req.user)) return true
  if (isUser(req.user)) return { id: { equals: req.user.id } }
  return false
}

const updateOwnOrModerator: Access = readOwnOrModerator

const moderatorFieldAccess: FieldAccess = ({ req }) => isModerator(req.user)

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    hidden: true,
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    admin: () => false,
    create: () => true,
    delete: ({ req }) => isModerator(req.user),
    read: readOwnOrModerator,
    update: updateOwnOrModerator,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'community',
      options: [
        { label: 'Comunidad', value: 'community' },
        { label: 'Moderador', value: 'moderator' },
      ],
      access: {
        create: moderatorFieldAccess,
        update: moderatorFieldAccess,
      },
    },
  ],
  versions: false,
}
