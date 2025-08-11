import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      label: 'Назва бренду',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'subcategory',
      label: 'Категорія',
      type: 'relationship',
      relationTo: 'subcategories',
      hasMany: true,
      required: true,
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
