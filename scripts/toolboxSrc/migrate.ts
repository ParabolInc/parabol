import path from 'path'
import * as migrate from 'rethinkdb-ts-migrate'
import {parse} from 'url'
import getProjectRoot from '../webpack/utils/getProjectRoot'

const startMigration = async () => {
  const [, , direction = 'up', count] = process.argv
  const all = count === '--all'
  if (process.env.NODE_ENV === 'test') {
    console.log('NODE_ENV is test, loading .env.test...')
  }
  const PROJECT_ROOT = getProjectRoot()
  const DB_ROOT = path.join(PROJECT_ROOT, 'packages/server/src/database')
  const {hostname, port, path: urlPath} = parse(process.env.RETHINKDB_URL)
  process.env.host = hostname
  process.env.port = port
  process.env.db = urlPath.slice(1)
  process.env.r = process.cwd()
  console.log('Migrating DB', process.env.db, DB_ROOT)
  try {
    await migrate[direction]({all, root: DB_ROOT})
  } catch (e) {
    console.error('Migration error', e)
    process.exit()
  }
  process.exit()
}

startMigration().catch(console.log)
