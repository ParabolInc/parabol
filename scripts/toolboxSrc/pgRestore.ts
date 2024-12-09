import cp from 'child_process'
import fs from 'fs'
import path from 'path'
import {promisify} from 'util'
import getPg from '../../packages/server/postgres/getPg'
import getPgConfig from '../../packages/server/postgres/getPgConfig'
import getProjectRoot from '../webpack/utils/getProjectRoot'
import {Logger} from '../../packages/server/utils/Logger'

async function pgRestore() {
  const exec = promisify(cp.exec)
  const FROM = process.argv[2] || 'orgBackup'
  const TO = process.argv[3] || 'public'
  const config = getPgConfig()
  const {user, password, database, host, port} = config
  const dbName = `postgresql://${user}:${password}@${host}:${port}/${database}`
  const PROJECT_ROOT = getProjectRoot()
  const SCHEMA_FILENAME = 'schemaDump.tar.gz'
  const DATA_FILENAME = 'orgBackupData.tar.gz'
  const PG_BACKUP_ROOT = path.join(PROJECT_ROOT, 'pgBackup')
  const SCHEMA_ROOT = path.join(PG_BACKUP_ROOT, SCHEMA_FILENAME)
  const DATA_ROOT = path.join(PG_BACKUP_ROOT, DATA_FILENAME)
  const requiredFiles = [SCHEMA_ROOT, DATA_ROOT]
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      Logger.log(`${file} does not exist`)
      return
    }
  }
  const pg = getPg()
  await exec(`pg_restore --dbname=${dbName} ${SCHEMA_ROOT} --clean --if-exists`)
  await pg.query(`ALTER SCHEMA "${TO}" RENAME TO "${FROM}"`)
  await exec(`pg_restore --dbname=${dbName} ${DATA_ROOT} --disable-triggers`)
  await pg.query(`ALTER SCHEMA "${FROM}" RENAME TO "${TO}"`)
  pg.end()
}

pgRestore()
