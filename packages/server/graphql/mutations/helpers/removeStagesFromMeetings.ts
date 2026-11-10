import getKysely from '../../../postgres/getKysely'
import type {NewMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import type {DataLoaderWorker} from '../../graphql'
import getNextFacilitatorStageAfterStageRemoved from './getNextFacilitatorStageAfterStageRemoved'

/*
 * NewMeetings have a predefined set of stages, we need to remove it manually
 */

const removeStagesFromMeeting = async (
  filterFn: (stage: any) => boolean,
  meetingId: string,
  now: Date
) => {
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const meeting = await trx
        .selectFrom('NewMeeting')
        .select(({fn}) => [
          'facilitatorStageId',
          fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases')
        ])
        .where('id', '=', meetingId)
        .forUpdate()
        .executeTakeFirst()
      if (!meeting) return
      const {phases} = meeting
      let {facilitatorStageId} = meeting
      let isChanged = false
      phases.forEach((phase) => {
        const {stages} = phase
        for (let i = stages.length - 1; i >= 0; i--) {
          const stage = stages[i]!
          if (filterFn(stage)) {
            const nextStage = getNextFacilitatorStageAfterStageRemoved(
              facilitatorStageId,
              stage.id,
              phases
            )
            if (nextStage.id !== facilitatorStageId) {
              facilitatorStageId = nextStage.id
              nextStage.startAt = now
              nextStage.viewCount = nextStage.viewCount ? nextStage.viewCount + 1 : 1
              nextStage.isNavigable = true
            }
            stages.splice(i, 1)
            isChanged = true
          }
        }
      })
      if (!isChanged) return
      await trx
        .updateTable('NewMeeting')
        .set({facilitatorStageId, phases: JSON.stringify(phases)})
        .where('id', '=', meetingId)
        .execute()
    })
}

const removeStagesFromMeetings = async (
  filterFn: (stage: any) => boolean,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const now = new Date()
  const [activeMeetings, completedMeetings] = await Promise.all([
    dataLoader.get('activeMeetingsByTeamId').load(teamId),
    dataLoader.get('completedMeetingsByTeamId').load(teamId)
  ])
  const meetingIds = activeMeetings
    .concat(completedMeetings)
    .filter(({phases}) => phases.some(({stages}) => stages.some(filterFn)))
    .map(({id}) => id)
  await Promise.all(
    meetingIds.map((meetingId) => removeStagesFromMeeting(filterFn, meetingId, now))
  )
  dataLoader.clearAll('newMeetings')
}

export default removeStagesFromMeetings
