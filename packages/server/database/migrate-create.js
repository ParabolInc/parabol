import getDotenv from '../../server/utils/dotenv'
import * as migrate from 'rethinkdb-ts-migrate'
import {parse} from 'url'

getDotenv()

const startMigration = async () => {
  const [, , name] = process.argv
  const {hostname, port, path} = parse(process.env.RETHINKDB_URL)
  process.env.host = hostname
  process.env.port = port
  process.env.db = path.slice(1)
  process.env.r = process.cwd()
  try {
    await migrate.create(name, __dirname)
  } catch (e) {
    process.exit()
  }
  process.exit()
}

startMigration()
