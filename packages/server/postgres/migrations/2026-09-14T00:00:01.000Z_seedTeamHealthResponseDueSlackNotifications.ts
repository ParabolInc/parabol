import {type Kysely, sql} from 'kysely'

// Uses the enum value the previous migration added, which pg only allows once that migration has
// committed (see transactionMode in .config/kyselyMigrations.ts). Every connected Slack user
// currently receives the reminder DM, and Mattermost/Teams channels subscribed to meetingStart
// currently receive the reminder post, so both are seeded on
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    INSERT INTO public."SlackNotification" (id, event, "teamId", "userId", "channelId")
    SELECT substr(md5(random()::text || "teamId" || "userId"), 1, 20), 'TEAM_HEALTH_RESPONSE_DUE', "teamId", "userId", "slackUserId"
    FROM public."SlackAuth"
    WHERE "isActive" = true
    ON CONFLICT ("teamId", "userId", event) DO NOTHING;

    UPDATE public."TeamNotificationSettings"
    SET events = array_append(events, 'TEAM_HEALTH_RESPONSE_DUE')
    WHERE 'meetingStart' = ANY(events) AND NOT ('TEAM_HEALTH_RESPONSE_DUE' = ANY(events));
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    DELETE FROM public."SlackNotification" WHERE event = 'TEAM_HEALTH_RESPONSE_DUE';
    UPDATE public."TeamNotificationSettings" SET events = array_remove(events, 'TEAM_HEALTH_RESPONSE_DUE');
  `.execute(db)
}
