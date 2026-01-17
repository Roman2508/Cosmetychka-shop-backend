import { Product } from '@/payload-types'
import type { CollectionConfig } from 'payload'
import ColorPickerField from '@/components/color-picker-field'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Товари',
    plural: 'Товари',
  },
  access: {
    read: () => true,
  },
  defaultPopulate: {
    photos: {
      image: true,
    },
  },
  fields: [
    {
      name: 'name',
      label: 'Назва товару',
      type: 'text',
      required: true,
    },

    {
      name: 'description',
      label: 'Опис товару',
      type: 'richText',
      required: true,

      // admin: {
      // elements: [
      //   'h1', 'h2', 'h3',
      //   'blockquote',
      //   'link',
      //   'ol', 'ul',
      // ],
      // leaves: [
      //   'bold',
      //   'italic',
      //   'underline',
      //   'strikethrough',
      // ],
      // },
    },

    {
      name: 'price',
      label: 'Ціна',
      type: 'number',
      required: true,
    },

    {
      name: 'subcategories',
      label: 'Категорія',
      type: 'relationship',
      relationTo: 'subcategories',
      hasMany: false,
      required: true,
    },
    {
      name: 'brand',
      label: 'Бренд',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: false,
      required: true,
    },

    {
      name: 'gender',
      label: 'Стать',
      type: 'select',
      required: false,
      options: [
        { label: 'Для чоловіків', value: 'man' },
        { label: 'Для жінок', value: 'woman' },
        { label: 'Унісекс', value: 'both' },
      ],
      defaultValue: 'both',
    },

    {
      name: 'status',
      label: 'Статус товару',
      type: 'select',
      required: false,
      options: [
        { label: 'В наявності', value: 'in_stock' },
        { label: 'Скоро у продажу', value: 'coming_soon' },
        { label: 'Немає в наявності', value: 'out_of_stock' },
        { label: 'Знято з виробництва', value: 'discontinued' },
      ],
      defaultValue: 'in_stock',
    },

    {
      name: 'hasDiscount',
      label: 'Є знижка?',
      type: 'checkbox',
    },

    {
      name: 'discount',
      label: 'Знижка',
      type: 'group',
      admin: {
        condition: (_, siblingData) => siblingData.hasDiscount === true,
      },
      fields: [
        {
          name: 'type',
          label: 'Тип знижки',
          type: 'select',
          options: [
            { label: 'Фіксована сума', value: 'fixed' },
            { label: 'Відсоток', value: 'percent' },
          ],
          required: true,
        },
        {
          name: 'value',
          label: 'Значення',
          type: 'number',
          required: true,
        },
      ],
    },

    {
      name: 'finalPrice',
      label: 'Фінальна ціна (з урахуванням знижки)',
      type: 'number',
      required: true,
      admin: { readOnly: true },
    },

    {
      name: 'hasVariations',
      label: 'Товар має варіації',
      type: 'checkbox',
    },

    {
      name: 'variantInfo',
      label: 'Інформація про варіацію',
      type: 'group',
      admin: {
        condition: (_, siblingData) => siblingData.hasVariations === true,
      },
      fields: [
        {
          name: 'variantName',
          label: 'Назва кольору або варіації',
          type: 'text',
          required: true,
        },
        {
          name: 'color',
          label: 'Відтінок',
          type: 'text',
          required: true,
          admin: {
            components: {
              Field: ColorPickerField,
            },
          },
        },
        {
          name: 'relatedProducts',
          label: 'Повʼязані товари (інші варіації цієї ж моделі)',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
        },
      ],
    },

    {
      name: 'tags',
      label: 'Мітки',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Хіт', value: 'hit' },
        { label: 'Новинка', value: 'new' },
        { label: 'Топ', value: 'top' },
      ],
    },

    {
      name: 'specs',
      label: 'Характеристики',
      type: 'array',
      fields: [
        {
          name: 'key',
          label: 'Назва',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          label: 'Значення',
          type: 'text',
          required: true,
        },
      ],
    },

    {
      name: 'photos',
      type: 'array',
      label: 'Фото',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        { name: 'caption', type: 'text' },
      ],
    },
  ],

  endpoints: [
    {
      path: '/:id/full',
      method: 'get',
      handler: async (req) => {
        if (!req?.routeParams?.id) {
          return Response.json({ error: 'Missing product ID' }, { status: 400 })
        }

        const product = await req.payload.findByID({
          collection: 'products',
          id: req.routeParams.id as string,
          req,
        })

        if (!product) {
          return Response.json({ error: 'Product not found' }, { status: 404 })
        }

        if (product.hasVariations && Array.isArray(product.variantInfo?.relatedProducts)) {
          const subReq = { ...(req as any), skipRelatedProducts: true } as any

          // @ts-ignore
          product.variantInfo.relatedProducts = await Promise.all(
            (product.variantInfo.relatedProducts ?? []).map(async (item: any) => {
              const prodId = typeof item === 'string' ? item : item.id
              const relatedProduct = await req.payload.findByID({
                collection: 'products',
                id: prodId,
                req: subReq,
              })
              return {
                id: prodId,
                hasVariations: relatedProduct.hasVariations,
                variantInfo: relatedProduct.variantInfo,
              }
            }),
          )
        }

        return Response.json(product)
      },
    },
  ],

  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        let finalPrice = data.price

        if (data.hasDiscount && data.discount) {
          if (data.discount.type === 'fixed') {
            finalPrice = Math.max(0, data.price - data.discount.value)
          }
          if (data.discount.type === 'percent') {
            finalPrice = Math.max(0, data.price - (data.price * data.discount.value) / 100)
          }
        }

        data.finalPrice = finalPrice
        return data
      },
    ],
    afterRead: [
      async ({ doc }) => {
        if (doc.description) {
          doc.description = convertLexicalToHTML({ data: doc.description })
        }
        return doc
      },
    ],
  },

  admin: {
    useAsTitle: 'name',
  },
}
