import path from 'path'
import * as migrate from 'rethinkdb-ts-migrate'
import {parse} from 'url'
import getProjectRoot from '../webpack/utils/getProjectRoot'

const startMigration = async () => {
  const name = process.argv[2]
  const {hostname, port, path: rethinkPath} = parse(process.env.RETHINKDB_URL)
  const PROJECT_ROOT = getProjectRoot()
  const DB_ROOT = path.join(PROJECT_ROOT, 'packages/server/database')
  process.env.host = hostname
  process.env.port = port
  process.env.db = rethinkPath.slice(1)
  process.env.r = process.cwd()
  try {
    await migrate.create(name, DB_ROOT)
  } catch (e) {
    process.exit()
  }
  process.exit()
}

startMigration()
