import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE TABLE IF NOT EXISTS "DomainJoinRequest" (
      "id" SERIAL PRIMARY KEY,
      "createdBy" VARCHAR(100) NOT NULL,
      "domain" VARCHAR(100) CHECK (lower(domain) = domain) NOT NULL,
      "expiresAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY("createdBy")
        REFERENCES "User"("id")
        ON DELETE CASCADE
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS "DomainJoinRequest_createdBy_domain_unique"
    ON "DomainJoinRequest" ("createdBy", "domain");
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "DomainJoinRequest";
  `)
  await client.end()
}
