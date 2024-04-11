import {Kysely, PostgresDialect, sql} from 'kysely'
import {Client} from 'pg'
import {RDatum, r} from 'rethinkdb-ts'
import getPg from '../getPg'
import getPgConfig from '../getPgConfig'

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
}

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  // I had to normalize domains to its own table to guarantee uniqueness (and make indexing easier)
  await sql`
  CREATE TABLE IF NOT EXISTS "SAML" (
    "id" VARCHAR(100) PRIMARY KEY,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "lastUpdatedBy" VARCHAR(100) NOT NULL DEFAULT 'aGhostUser',
    "url" VARCHAR(2056),
    "metadata" VARCHAR(65536),
    "orgId" VARCHAR(100) UNIQUE,
    CONSTRAINT "fk_lastUpdatedBy"
      FOREIGN KEY("lastUpdatedBy")
        REFERENCES "User"("id")
        ON DELETE SET DEFAULT
  );
  CREATE INDEX IF NOT EXISTS "idx_SAML_orgId" ON "SAML"("orgId");
  DROP TRIGGER IF EXISTS "update_SAML_updatedAt" ON "SAML";
  CREATE TRIGGER "update_SAML_updatedAt" BEFORE UPDATE ON "SAML" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

  CREATE TABLE IF NOT EXISTS "SAMLDomain" (
    "domain" VARCHAR(255) CHECK (lower(domain) = domain) PRIMARY KEY,
    "samlId" VARCHAR(100),
    CONSTRAINT "fk_samlId"
      FOREIGN KEY("samlId")
        REFERENCES "SAML"("id")
        ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS "idx_SAMLDomain_samlId" ON "SAMLDomain"("samlId");
  `.execute(pg)

  // Attempt to assign an orgId to existing SAML records
  // It isn't perfect because some orgs have downgraded, leaving orphaned SAML records
  // This is why orgId is nullable for now
  await r
    .table('SAML')
    .update(
      (saml: RDatum) => ({
        orgId: r
          .table('Organization')
          .getAll(r.args(saml('domains')), {index: 'activeDomain'})
          .limit(1)
          .nth(0)('id')
          .default(null)
      }),
      {nonAtomic: true}
    )
    .run()

  const existingSAMLs = await r.table('SAML').coerceTo('array').run()
  if (existingSAMLs.length === 0) return
  const nextSAMLs = existingSAMLs.map((saml) => {
    const {domains, ...rest} = saml
    return rest
  })

  const nextSAMLDomains = [] as {domain: string; samlId: string}[]
  existingSAMLs.forEach((saml) => {
    saml.domains.forEach((domain: any) => {
      nextSAMLDomains.push({domain, samlId: saml.id})
    })
  })

  await pg.insertInto('SAML').values(nextSAMLs).execute()
  await pg.insertInto('SAMLDomain').values(nextSAMLDomains).execute()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TABLE IF EXISTS "SAMLDomain"; DROP TABLE IF EXISTS "SAML"; `)
  await client.end()
}
