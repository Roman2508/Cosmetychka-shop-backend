'use client'

import React, { FC } from 'react'
import { useField } from '@payloadcms/ui'

// @ts-ignore
const ColorPickerField: any = ({ path }) => {
  const { value, setValue } = useField<string>({ path })

  return (
    <div className="">
      <label
        style={{ marginBottom: '5px', display: 'block', fontWeight: 400, color: 'rgb(47, 47, 47)' }}
      >
        Виберіть колір
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '16px' }}>
        <input
          type="color"
          value={value ?? '#ffffff'}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: 48, height: 32, border: 'none', cursor: 'pointer' }}
        />
        <p>{value ?? '#ffffff'}</p>
      </div>
    </div>
  )
}

export default ColorPickerField
