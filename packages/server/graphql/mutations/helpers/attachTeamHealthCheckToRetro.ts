import getKysely from '../../../postgres/getKysely'
import type {NewMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import getRetroTeamHealthStage from './getRetroTeamHealthStage'

// a retro shows one check for good, so a check already attached stays. A check the retro started
// also ends with the retro. Locked, since a teammate joining the retro rewrites the same phases
const attachTeamHealthCheckToRetro = async (
  retroMeetingId: string,
  teamHealthMeetingId: string,
  isStartedInRetro: boolean
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
      const attachedId = checkStage.teamHealthMeetingId
      if (attachedId && attachedId !== teamHealthMeetingId) return
      checkStage.teamHealthMeetingId = teamHealthMeetingId
      if (isStartedInRetro) checkStage.startedTeamHealthMeetingId = teamHealthMeetingId
      await trx
        .updateTable('NewMeeting')
        .set({phases: JSON.stringify(retro.phases)})
        .where('id', '=', retroMeetingId)
        .execute()
    })
}

export default attachTeamHealthCheckToRetro
