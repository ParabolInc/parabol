import {defineConfig} from 'kysely-ctl'
import getKysely from '../packages/server/postgres/getKysely'

export default defineConfig({
  kysely: getKysely(),
  migrations: {
    getMigrationPrefix: () => `${new Date().toISOString()}_`,
    migrationFolder: './packages/server/postgres/migrations',
    migrationTableSchema: 'public',
    migrationTableName: '_migration',
    migrationLockTableName: '_migrationLock'
  }
})
