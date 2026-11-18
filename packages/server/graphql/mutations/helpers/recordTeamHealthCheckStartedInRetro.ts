import getKysely from '../../../postgres/getKysely'
import type {NewMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import getPhase from '../../../utils/getPhase'

// the retro remembers the check it started, so ending the retro ends that check too. Locked, since a
// teammate joining the retro rewrites the same phases
const recordTeamHealthCheckStartedInRetro = async (
  retroMeetingId: string,
  teamHealthMeetingId: string
) => {
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const retro = await trx
        .selectFrom('NewMeeting')
        .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
        .where('id', '=', retroMeetingId)
        .forUpdate()
        .executeTakeFirst()
      const checkStage = retro && getPhase(retro.phases, 'TEAM_HEALTH_CHECK')?.stages[0]
      if (!retro || !checkStage) return
      checkStage.startedTeamHealthMeetingId = teamHealthMeetingId
      await trx
        .updateTable('NewMeeting')
        .set({phases: JSON.stringify(retro.phases)})
        .where('id', '=', retroMeetingId)
        .execute()
    })
}

export default recordTeamHealthCheckStartedInRetro
