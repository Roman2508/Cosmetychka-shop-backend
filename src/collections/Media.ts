import type { CollectionConfig } from 'payload'

const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Фото',
    plural: 'Фото',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
  ],
  admin: {
    useAsTitle: 'alt',
  },
}

export default Media
