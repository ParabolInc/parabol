import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS "AtlassianAuth"`.execute(db)
  await sql`DROP TABLE IF EXISTS "GitHubAuth"`.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // Schema only: the rows were copied into TeamMemberIntegrationAuth by unifyJiraGitHubAuth and are not restored
  await sql`
    CREATE TABLE IF NOT EXISTS "AtlassianAuth" (
      "accessToken" varchar(8192) NOT NULL,
      "refreshToken" varchar(8192) NOT NULL,
      "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" boolean DEFAULT true NOT NULL,
      "jiraSearchQueries" jsonb[] DEFAULT '{}' NOT NULL,
      "cloudIds" varchar(120)[] DEFAULT '{}' NOT NULL,
      scope varchar(1000) NOT NULL,
      "accountId" varchar(120) NOT NULL,
      "teamId" varchar(120) NOT NULL,
      "userId" varchar(120) NOT NULL,
      CONSTRAINT "AtlassianAuth_pkey" PRIMARY KEY ("userId", "teamId"),
      CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES "Team"(id) ON DELETE CASCADE,
      CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
    )
  `.execute(db)
  await sql`
    CREATE TABLE IF NOT EXISTS "GitHubAuth" (
      "accessToken" varchar(40) NOT NULL,
      "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" boolean DEFAULT true NOT NULL,
      login varchar(200) NOT NULL,
      "teamId" varchar(100) NOT NULL,
      "userId" varchar(100) NOT NULL,
      "githubSearchQueries" jsonb[] DEFAULT '{}' NOT NULL,
      scope varchar(250) NOT NULL,
      CONSTRAINT "GitHubAuth_pkey" PRIMARY KEY ("userId", "teamId"),
      CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES "Team"(id) ON DELETE CASCADE,
      CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
    )
  `.execute(db)
  await sql`
    DROP TRIGGER IF EXISTS "update_AtlassianAuth_updatedAt" ON "AtlassianAuth";
    CREATE TRIGGER "update_AtlassianAuth_updatedAt" BEFORE UPDATE ON "AtlassianAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
    DROP TRIGGER IF EXISTS "update_GitHubAuth_updatedAt" ON "GitHubAuth";
    CREATE TRIGGER "update_GitHubAuth_updatedAt" BEFORE UPDATE ON "GitHubAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"()
  `.execute(db)
}
