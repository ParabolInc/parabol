import * as migrate from 'rethinkdb-ts-migrate'
import {parse} from 'url'
import '../dotenv'

const startMigration = async () => {
  const [, , direction = 'up', count] = process.argv
  const all = count === '--all'
  if (process.env.NODE_ENV === 'test') {
    console.log('NODE_ENV is test, loading .env.test...')
  }

  const {hostname, port, path} = parse(process.env.RETHINKDB_URL)
  process.env.host = hostname
  process.env.port = port
  process.env.db = path.slice(1)
  process.env.r = process.cwd()
  console.log('Migrating DB', process.env.db)
  try {
    await migrate[direction]({all, root: __dirname})
  } catch (e) {
    console.error('Migration error', e)
    process.exit()
  }
  process.exit()
}

startMigration().catch(console.log)
