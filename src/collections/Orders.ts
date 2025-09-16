import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Замовлення',
    plural: 'Замовлення',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'status',
      label: 'Статус замовлення',
      type: 'select',
      required: false,
      options: [
        { label: 'Очікується', value: 'pending' },
        { label: 'Виконується', value: 'processing' },
        { label: 'Завершено', value: 'completed' },
        { label: 'Скасовано', value: 'cancelled' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'username',
      label: 'ПІБ',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      label: 'Номер телефону',
      type: 'text',
      required: true,
    },
    {
      name: 'note',
      label: 'Примітка',
      type: 'text',
      required: false,
    },
    {
      name: 'totalPrice',
      label: 'Загальна сума',
      type: 'number',
      // admin: { readOnly: true },
    },
    {
      name: 'products',
      type: 'array',
      fields: [
        {
          label: 'Товар',
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          hasMany: false,
        },
        { name: 'quantity', label: 'Кількість', required: true, type: 'number' },
      ],
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const orderedProductsId: number[] = data.products.map((el: any) => el.product)

        const products = await req.payload.find({
          collection: 'products',
          where: { id: { in: orderedProductsId } },
        })

        const nameMap = products.docs.map((prod) => ({ id: prod.id, name: prod.name }))

        const productList = data.products.map(
          (product: { product: number; quantity: number }, index: number) => {
            const currentProduct = nameMap.find((el) => el.id === product.product)
            return `${index + 1}. ${currentProduct ? currentProduct.name : 'Невідомий товар'} — <b>${product.quantity} шт.</b>`
          },
        )

        const telegramText = `
<b>🛒 НОВЕ ЗАМОВЛЕННЯ!</b>\n
<b>👤 Ім'я:</b> ${data.username}\n
<b>📞 Телефон:</b> ${data.phone}\n
<b>📝 Коментар:</b> ${data.note || '-'}\n
<b>📦 Товари:</b>\n${productList.join('\n')}\n
<b>💰 Загальна сума замовлення:</b> ${data.totalPrice} грн
`

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: telegramText,
            parse_mode: 'HTML',
          }),
        })

        return data
      },
    ],
  },
}
