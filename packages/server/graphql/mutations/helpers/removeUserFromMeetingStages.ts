import EstimateStage from '../../../database/types/EstimateStage'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'
import getRethink from '../../../database/rethinkDriver'
import Meeting from '../../../database/types/Meeting'

/*
 * Removes the following user-specific details from a stage:
 *  - readyToAdvance
 */

const removeUserFromMeetingStages = async (userId: string, meetings: Meeting[]) => {
  const now = new Date()
  const r = await getRethink()
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
          if (!readyToAdvance && !scores) continue
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
