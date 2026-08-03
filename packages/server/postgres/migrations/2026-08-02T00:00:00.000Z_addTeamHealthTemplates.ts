import type {Kysely} from 'kysely'

const SEED_DATE = new Date('2026-07-08T00:00:00.000Z')

// One built-in MeetingTemplate per team-health question pack (seeded in the
// addTeamHealth migration). Each template exposes every question in its pack via
// TeamHealthTemplateQuestion. `name` matches the pack name 1:1 so we can look the
// pack up by name. Inserting rows of type 'teamHealth' is safe here — even when this
// runs in the same batch transaction as addTeamHealth — because that migration
// recreates MeetingTypeEnum (rather than ALTER TYPE ... ADD VALUE); values of a type
// created in the current transaction can be used within it.
const PACK_TEMPLATES: {id: string; name: string; isStarter: boolean}[] = [
  // canonical pack: mirror the "one starter per category" convention
  {id: 'googleProjectAristotleTemplate', name: 'Google Project Aristotle', isStarter: true},
  {
    id: 'edmondsonPsychologicalSafetyTemplate',
    name: 'Edmondson Psychological Safety',
    isStarter: true
  },
  {
    id: 'lencioniFiveDysfunctionsTemplate',
    name: 'Lencioni Five Dysfunctions',
    isStarter: true
  },
  {id: 'hackmanTeamDiagnosticTemplate', name: 'Hackman Team Diagnostic', isStarter: true},
  {id: 'gallupQ12Template', name: 'Gallup Q12', isStarter: true},
  {id: 'spotifySquadHealthCheckTemplate', name: 'Spotify Squad Health Check', isStarter: true},
  {
    id: 'atlassianTeamHealthMonitorTemplate',
    name: 'Atlassian Team Health Monitor',
    isStarter: true
  },
  {
    id: 'googleProjectOxygenTemplate',
    name: 'Google Project Oxygen',
    isStarter: true
  },
  {id: 'scarfModelTemplate', name: 'David Rock — SCARF', isStarter: true}
]

// A grab-bag template linking every question from every built-in pack. Has no pack of
// its own, so its questions are seeded separately from the per-pack loop below.
const EVERYTHING_BAGEL = {id: 'everythingBagelTemplate', name: 'Everything Bagel', isStarter: true}

const TEMPLATES = [...PACK_TEMPLATES, EVERYTHING_BAGEL]

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('MeetingTemplate')
    .values(
      TEMPLATES.map(({id, name, isStarter}) => ({
        id,
        name,
        type: 'teamHealth',
        // teamHealth has its own ActivityLibrary category
        // (see MEETING_TYPE_TO_CATEGORY in packages/client/components/ActivityLibrary/Categories.tsx)
        mainCategory: 'teamHealth',
        teamId: 'aGhostTeam',
        orgId: 'aGhostOrg',
        scope: 'PUBLIC',
        isActive: true,
        isStarter,
        isFree: true,
        illustrationUrl: '/assets/Organization/aGhostOrg/template/teamHealth.png',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      }))
    )
    .execute()

  // Link every question in each pack to its template
  for (const {id: templateId, name} of PACK_TEMPLATES) {
    const pack = await db
      .selectFrom('TeamHealthQuestionPack')
      .select('id')
      .where('name', '=', name)
      .where('userId', '=', 'aGhostUser')
      .executeTakeFirstOrThrow()
    const questions = await db
      .selectFrom('TeamHealthQuestion')
      .select('id')
      .where('packId', '=', pack.id)
      .where('removedAt', 'is', null)
      .execute()
    await db
      .insertInto('TeamHealthTemplateQuestion')
      .values(questions.map(({id: questionId}: {id: number}) => ({templateId, questionId})))
      .execute()
  }

  // Everything Bagel: link every question across all built-in packs
  const allQuestions = await db
    .selectFrom('TeamHealthQuestion')
    .innerJoin('TeamHealthQuestionPack', 'TeamHealthQuestionPack.id', 'TeamHealthQuestion.packId')
    .select('TeamHealthQuestion.id')
    .where('TeamHealthQuestionPack.userId', '=', 'aGhostUser')
    .execute()
  await db
    .insertInto('TeamHealthTemplateQuestion')
    .values(
      allQuestions.map(({id: questionId}: {id: number}) => ({
        templateId: EVERYTHING_BAGEL.id,
        questionId
      }))
    )
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // TeamHealthTemplateQuestion rows cascade on MeetingTemplate delete
  await db
    .deleteFrom('MeetingTemplate')
    .where(
      'id',
      'in',
      TEMPLATES.map(({id}) => id)
    )
    .execute()
}
