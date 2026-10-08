import fs from 'fs'
import path from 'path'
import type {Client} from 'pg'
import connectToPostgres from './connectToPostgres.mts'

// `pnpm kysely migrate:latest` takes over a second to find out that there is nothing to do
// The server waits for the migrations, so the usual case of nothing pending is checked directly
const hasPendingMigrations = async (projectRoot: string) => {
  const migrationRoot = path.join(projectRoot, 'packages/server/postgres/migrations')
  const migrationNames = fs
    .readdirSync(migrationRoot)
    .filter((name) => name.endsWith('.ts'))
    .map((name) => name.slice(0, -'.ts'.length))
  let client: Client | undefined
  try {
    client = await connectToPostgres()
    const {rows} = await client.query<{name: string}>('SELECT name FROM "_migrationV2"')
    const appliedNames = new Set(rows.map((row) => row.name))
    return migrationNames.some((name) => !appliedNames.has(name))
  } catch {
    return true
  } finally {
    await client?.end()
  }
}

export default hasPendingMigrations
