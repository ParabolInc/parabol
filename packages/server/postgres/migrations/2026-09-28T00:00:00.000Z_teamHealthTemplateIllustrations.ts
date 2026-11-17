import type {Kysely} from 'kysely'

const TEMPLATE_IDS = [
  'googleProjectAristotleTemplate',
  'edmondsonPsychologicalSafetyTemplate',
  'lencioniFiveDysfunctionsTemplate',
  'hackmanTeamDiagnosticTemplate',
  'gallupQ12Template',
  'spotifySquadHealthCheckTemplate',
  'atlassianTeamHealthMonitorTemplate',
  'googleProjectOxygenTemplate',
  'scarfModelTemplate',
  'everythingBagelTemplate'
]

const PREVIOUS_URL = '/assets/Organization/aGhostOrg/template/teamHealth.png'
const urlFor = (templateId: string) => `/assets/Organization/aGhostOrg/template/${templateId}.svg`

export async function up(db: Kysely<any>): Promise<void> {
  for (const templateId of TEMPLATE_IDS) {
    await db
      .updateTable('MeetingTemplate')
      .set({illustrationUrl: urlFor(templateId)})
      .where((eb) =>
        eb.or([
          eb('id', '=', templateId),
          eb.and([
            eb('parentTemplateId', '=', templateId),
            eb('illustrationUrl', '=', PREVIOUS_URL)
          ])
        ])
      )
      .execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const templateId of TEMPLATE_IDS) {
    await db
      .updateTable('MeetingTemplate')
      .set({illustrationUrl: PREVIOUS_URL})
      .where((eb) =>
        eb.or([
          eb('id', '=', templateId),
          eb.and([
            eb('parentTemplateId', '=', templateId),
            eb('illustrationUrl', '=', urlFor(templateId))
          ])
        ])
      )
      .execute()
  }
}
