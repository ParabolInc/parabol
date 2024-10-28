import {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('FeatureFlag')
    .values([
      {
        featureName: 'insights',
        description: 'Whether the team has access to an AI summary of their wins and challenges',
        expiresAt: new Date('2025-01-31T00:00:00.000Z'),
        scope: 'Team'
      },
      {
        featureName: 'publicTeams',
        description: 'Whether users can see teams they are not a member of in an org',
        expiresAt: new Date('2025-01-31T00:00:00.000Z'),
        scope: 'Organization'
      },
      {
        featureName: 'relatedDiscussions',
        description:
          'A comment in a retro discussion thread that uses AI to show similar conversations in the past',
        expiresAt: new Date('2025-01-31T00:00:00.000Z'),
        scope: 'Organization'
      },
      {
        featureName: 'standupAISummary',
        description: 'Whether the standup UI has an AI meeting Summary or not',
        expiresAt: new Date('2025-01-31T00:00:00.000Z'),
        scope: 'Organization'
      },
      {
        featureName: 'suggestGroups',
        description: 'Auto-group reflections using AI',
        expiresAt: new Date('2025-01-31T00:00:00.000Z'),
        scope: 'Organization'
      }
    ])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('FeatureFlag')
    .where('featureName', 'in', [
      'insights',
      'publicTeams',
      'relatedDiscussions',
      'standupAISummary',
      'suggestGroups'
    ])
    .execute()
}
