import {defineConfig} from 'kysely-ctl'
import getKysely from '../packages/server/postgres/getKysely'
import {migrations} from './kyselyMigrations'

export default defineConfig({
  kysely: getKysely(),
  migrations
})
