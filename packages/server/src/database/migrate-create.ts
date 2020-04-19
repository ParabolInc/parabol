import path from 'path'
import * as migrate from 'rethinkdb-ts-migrate'
import {parse} from 'url'
import '../.dotenv'

const startMigration = async () => {
  const [, , name] = process.argv
  const {hostname, port, path: rethinkPath} = parse(process.env.RETHINKDB_URL)
  process.env.host = hostname
  process.env.port = port
  process.env.db = rethinkPath.slice(1)
  process.env.r = process.cwd()
  try {
    await migrate.create(name, path.join(__dirname, '../../src/database'))
  } catch (e) {
    process.exit()
  }
  process.exit()
}

startMigration()
