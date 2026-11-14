import path from 'path'
import connectToPostgres from './connectToPostgres.mts'

// Gives this checkout its own database, its own valkey db & local file storage
// so that it shares no state with the other stacks on this machine or with anything outside of it
const isolateStack = async (projectRoot: string, portOffset: number) => {
  const {POSTGRES_DB, REDIS_URL} = process.env
  if (!POSTGRES_DB || !REDIS_URL) throw new Error('POSTGRES_DB & REDIS_URL must be set in .env')
  const checkoutName = path.basename(projectRoot).replace(/\W+/g, '_').toLowerCase()
  const database = `${POSTGRES_DB}_${checkoutName}`
  const client = await connectToPostgres('postgres')
  const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database])
  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE "${database}"`)
    console.log(`Created the database ${database}`)
  }
  await client.end()
  process.env.POSTGRES_DB = database
  if (existing.rowCount === 0 && process.env.POSTGRES_USE_PGVECTOR === 'true') {
    // the embedder creates its tables while its own extension check is still running, which only works out if the extension exists
    const databaseClient = await connectToPostgres()
    await databaseClient.query('CREATE EXTENSION IF NOT EXISTS "vector"')
    await databaseClient.end()
  }

  // db 0 belongs to the stacks that are not isolated. The port offset is unique among the stacks that are running
  const valkeyUrl = new URL(REDIS_URL)
  valkeyUrl.pathname = `/${((portOffset / 10) % 15) + 1}`
  process.env.REDIS_URL = valkeyUrl.toString()

  process.env.FILE_STORE_PROVIDER = 'local'
  process.env.CDN_BASE_URL = ''
  process.env.MAIL_PROVIDER = 'debug'
}

export default isolateStack
