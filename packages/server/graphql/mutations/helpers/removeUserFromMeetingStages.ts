import getKysely from '../../../postgres/getKysely'
import type {NewMeetingPhase, NewMeetingStage} from '../../../postgres/types/NewMeetingPhase'
import type {DataLoaderWorker} from '../../graphql'
import {isEstimateStage} from '../../meetingTypePredicates'

/*
 * Removes the following user-specific details from a stage:
 *  - readyToAdvance
 *  - estimate scores
 */

const getUserStages = (userId: string, phases: NewMeetingPhase[]) =>
  phases
    .flatMap(({stages}): NewMeetingStage[] => stages)
    .filter(
      (stage) =>
        !!stage.readyToAdvance?.includes(userId) ||
        (isEstimateStage(stage) && stage.scores.some((score) => score.userId === userId))
    )

const removeUserFromMeeting = async (userId: string, meetingId: string) => {
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const meeting = await trx
        .selectFrom('NewMeeting')
        .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
        .where('id', '=', meetingId)
        .forUpdate()
        .executeTakeFirst()
      if (!meeting) return
      const {phases} = meeting
      const userStages = getUserStages(userId, phases)
      if (userStages.length === 0) return
      userStages.forEach((stage) => {
        stage.readyToAdvance = stage.readyToAdvance?.filter((readyUserId) => readyUserId !== userId)
        if (isEstimateStage(stage)) {
          stage.scores = stage.scores.filter((score) => score.userId !== userId)
        }
      })
      await trx
        .updateTable('NewMeeting')
        .set({phases: JSON.stringify(phases)})
        .where('id', '=', meetingId)
        .execute()
    })
}

const removeUserFromMeetingStages = async (
  userId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const [activeMeetings, completedMeetings] = await Promise.all([
    dataLoader.get('activeMeetingsByTeamId').load(teamId),
    dataLoader.get('completedMeetingsByTeamId').load(teamId)
  ])
  const meetingIds = activeMeetings
    .concat(completedMeetings)
    .filter(({phases}) => getUserStages(userId, phases).length > 0)
    .map(({id}) => id)
  await Promise.all(meetingIds.map((meetingId) => removeUserFromMeeting(userId, meetingId)))
  dataLoader.clearAll('newMeetings')
}

export default removeUserFromMeetingStages
