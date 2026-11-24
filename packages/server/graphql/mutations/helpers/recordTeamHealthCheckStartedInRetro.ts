import getKysely from '../../../postgres/getKysely'
import type {NewMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import getRetroTeamHealthStage from './getRetroTeamHealthStage'

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
      const checkStage = retro && getRetroTeamHealthStage(retro.phases)
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
