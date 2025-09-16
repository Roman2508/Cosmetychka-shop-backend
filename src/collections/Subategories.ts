import type { CollectionConfig } from 'payload'

export const Subcategories: CollectionConfig = {
  slug: 'subcategories',
  labels: {
    singular: 'Підкатегорія товарів',
    plural: 'Підкатегорії товарів',
  },
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
      name: 'products',
      label: 'Товари',
      type: 'relationship',
      relationTo: 'products',
    },
  ],
  admin: {
    useAsTitle: 'name',
  },
}
