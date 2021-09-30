import EstimateStage from '../../../database/types/EstimateStage'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'
import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'

/*
 * Removes the following user-specific details from a stage:
 *  - readyToAdvance
 */

const removeUserFromMeetingStages = async (
  userId: string,
  teamId: string,
  dataLoader: DataLoaderWorker,
  includeCompletedMeetings: boolean = false
) => {
  const now = new Date()
  const r = await getRethink()
  let meetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  if (includeCompletedMeetings) {
    const completedMeetings = await dataLoader.get('completedMeetingsByTeamId').load(teamId)
    meetings = meetings.concat(completedMeetings)
  }
  await Promise.all(
    meetings.map((meeting) => {
      const {id: meetingId, phases} = meeting
      let isChanged = false
      phases.forEach((phase) => {
        // do this inside the loop since it's mutative
        const {stages} = phase
        for (let i = 0; i < stages.length; i++) {
          const stage = stages[i]
          const {readyToAdvance} = stage as GenericMeetingStage | EstimateStage
          const scores = (stage as EstimateStage).scores
          if (readyToAdvance) {
            const userIdIdx = readyToAdvance.indexOf(userId)
            if (userIdIdx !== -1) {
              readyToAdvance.splice(userIdIdx, 1)
              isChanged = true
            }
          }
          if (scores) {
            const userIdIdx = scores.map(({userId}) => userId).indexOf(userId)
            if (userIdIdx !== -1) {
              scores.splice(userIdIdx, 1)
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
