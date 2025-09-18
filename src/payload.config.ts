import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'

import Media from './collections/Media'
import { Users } from './collections/Users'
import { Orders } from './collections/Orders'
import { Brands } from './collections/Brands'
import { Products } from './collections/Products'
import { Categories } from './collections/Categories'
import { Subcategories } from './collections/Subategories'

import { en } from '@payloadcms/translations/languages/en'
import { uk } from '@payloadcms/translations/languages/uk'
import { ru } from '@payloadcms/translations/languages/ru'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.SERVER_URL,
  cors: process.env.CORS_URLS ? process.env.CORS_URLS.split(',') : [],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Products, Categories, Subcategories, Brands, Orders, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 5000000, // 5MB, written in bytes
    },
  },
  db: postgresAdapter({
    pool: {
      database: process.env.DATABASE_NAME || '',
      host: process.env.DATABASE_HOST || '',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      user: process.env.DATABASE_USER || '',
      password: process.env.DATABASE_PASSWORD || '',
      // ssl: {
      //   rejectUnauthorized: false,
      // },
      ssl: false,
    },
  }),
  sharp,
  plugins: [payloadCloudPlugin()],
  i18n: {
    fallbackLanguage: 'uk',
    // @ts-ignore
    supportedLanguages: { en, uk, ru },
    translations: { ru, uk, en },
  },
})
