// storage-adapter-import-placeholder
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.SERVER_URL || 'http://localhost:7777',
  cors: [process.env.FRONTEND_URL || 'http://localhost:3000'],

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
  db: postgresAdapter({
    pool: {
      // connectionString: process.env.DATABASE_URI || '',
      database: process.env.DATABASE_NAME || '',
      host: process.env.DATABASE_HOST || '',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      user: process.env.DATABASE_USER || '',
      password: process.env.DATABASE_PASSWORD || '',
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),

    s3Storage({
      collections: {
        media: {
          disableLocalStorage: true,
          generateFileURL: ({ filename }) =>
            `${process.env.CLOUDFLARE_PUBLIC_BUCKET_URL}/${filename}`,
        },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: process.env.R2_ENDPOINT || '',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        forcePathStyle: true,
      },
    }),
  ],
})
