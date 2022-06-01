import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_Team_updatedAt" ON "Team";
    CREATE TRIGGER "update_Team_updatedAt" BEFORE UPDATE ON "Team" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

    DROP TRIGGER IF EXISTS "update_AtlassianAuth_updatedAt" ON "AtlassianAuth";
    CREATE TRIGGER "update_AtlassianAuth_updatedAt" BEFORE UPDATE ON "AtlassianAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

    DROP TRIGGER IF EXISTS "update_TeamMemberIntegrationAuth_updatedAt" ON "TeamMemberIntegrationAuth";
    CREATE TRIGGER "update_TeamMemberIntegrationAuth_updatedAt" BEFORE UPDATE ON "TeamMemberIntegrationAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

    DROP TRIGGER IF EXISTS "update_IntegrationProvider_updatedAt" ON "IntegrationProvider";
    CREATE TRIGGER "update_IntegrationProvider_updatedAt" BEFORE UPDATE ON "IntegrationProvider" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

    DROP TRIGGER IF EXISTS "update_GitHubAuth_updatedAt" ON "GitHubAuth";
    CREATE TRIGGER "update_GitHubAuth_updatedAt" BEFORE UPDATE ON "GitHubAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

    DROP TRIGGER IF EXISTS "update_Poll_updatedAt" ON "Poll";
    CREATE TRIGGER "update_Poll_updatedAt" BEFORE UPDATE ON "Poll" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

    DROP TRIGGER IF EXISTS "update_PollOption_updatedAt" ON "PollOption";
    CREATE TRIGGER "update_PollOption_updatedAt" BEFORE UPDATE ON "PollOption" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

    DROP TRIGGER IF EXISTS "update_TeamPromptResponse_updatedAt" ON "TeamPromptResponse";
    CREATE TRIGGER "update_TeamPromptResponse_updatedAt" BEFORE UPDATE ON "TeamPromptResponse" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_Team_updatedAt" ON "Team";

    DROP TRIGGER IF EXISTS "update_AtlassianAuth_updatedAt" ON "AtlassianAuth";

    DROP TRIGGER IF EXISTS "update_TeamMemberIntegrationAuth_updatedAt" ON "TeamMemberIntegrationAuth";

    DROP TRIGGER IF EXISTS "update_IntegrationProvider_updatedAt" ON "IntegrationProvider";

    DROP TRIGGER IF EXISTS "update_GitHubAuth_updatedAt" ON "GitHubAuth";

    DROP TRIGGER IF EXISTS "update_Poll_updatedAt" ON "Poll";

    DROP TRIGGER IF EXISTS "update_PollOption_updatedAt" ON "PollOption";

    DROP TRIGGER IF EXISTS "update_TeamPromptResponse_updatedAt" ON "TeamPromptResponse";
  `)
  await client.end()
}
