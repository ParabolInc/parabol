import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'
import {isEstimateStage} from '../../meetingTypePredicates'

/*
 * Removes the following user-specific details from a stage:
 *  - readyToAdvance
 */

const removeUserFromMeetingStages = async (
  userId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const now = new Date()
  const r = await getRethink()
  const [activeMeetings, completedMeetings] = await Promise.all([
    dataLoader.get('activeMeetingsByTeamId').load(teamId),
    dataLoader.get('completedMeetingsByTeamId').load(teamId)
  ])
  const meetings = activeMeetings.concat(completedMeetings)

  await Promise.all(
    meetings.map((meeting) => {
      const {id: meetingId, phases} = meeting
      let isChanged = false
      phases.forEach((phase) => {
        // do this inside the loop since it's mutative
        const {stages} = phase
        for (let i = 0; i < stages.length; i++) {
          const stage = stages[i]!
          const {readyToAdvance} = stage
          const userIdIdx = readyToAdvance?.indexOf(userId) ?? -1
          if (userIdIdx !== -1) {
            readyToAdvance?.splice(userIdIdx, 1)
            isChanged = true
          }
          if (isEstimateStage(stage)) {
            const userIdIdx = stage.scores.map(({userId}) => userId).indexOf(userId)
            if (userIdIdx !== -1) {
              stage.scores.splice(userIdIdx, 1)
              isChanged = true
            }
          }
        }
      })
      if (!isChanged) return Promise.resolve(undefined)
      return r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          phases,
          updatedAt: now
        })
        .run()
    })
  )
  return meetings.map((meeting) => meeting.id)
}

export default removeUserFromMeetingStages
