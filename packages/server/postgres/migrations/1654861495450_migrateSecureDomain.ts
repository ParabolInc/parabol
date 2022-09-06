import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import {ParabolR} from '../../database/rethinkDriver'
import getPgConfig from '../getPgConfig'

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
  return r as any as ParabolR
}

export async function up() {
  await connectRethinkDB()
  const client = new Client(getPgConfig())
  await client.connect()
  const securedDomains = (await r.table('SecureDomain').coerceTo('array').run()) as {
    id: string
    domain: string
  }[]
  await Promise.all(
    securedDomains.map((sd) => {
      return client.query(
        `
    INSERT INTO "OrganizationApprovedDomain" ("domain", "orgId", "addedByUserId")
    VALUES($1, $2, $3)`,
        [sd.domain.trim().toLowerCase(), 'aGhostOrg', 'aGhostUser']
      )
    })
  )
  await client.end()
  await r.getPoolMaster()?.drain()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DELETE FROM "OrganizationApprovedDomain"
  WHERE "userId" = "aGhostUser";`)
  await client.end()
}
