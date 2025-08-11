import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      label: 'Назва категорії',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'subcategories',
      label: 'Підкатегорії',
      type: 'relationship',
      relationTo: 'subcategories',
      hasMany: true,
    },
  ],
  admin: {
    useAsTitle: 'name',
  },
}
