import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import generateUID from '../../../generateUID'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import createNewMeetingPhases from './createNewMeetingPhases'

const createTeamPrompt = async (teamId, facilitatorId, r, dataLoader) => {
  const meetingType: MeetingTypeEnum = 'teamPrompt'
  const meetingCount = await r
    .table('NewMeeting')
    .getAll(teamId, {index: 'teamId'})
    .filter({meetingType})
    .count()
    .default(0)
    .run()
  const meetingId = generateUID()
  const phases = await createNewMeetingPhases(
    facilitatorId,
    teamId,
    meetingId,
    meetingCount,
    meetingType,
    dataLoader
  )
  return new MeetingTeamPrompt({
    id: meetingId,
    teamId,
    meetingCount,
    phases,
    facilitatorUserId: facilitatorId,
    meetingPrompt: 'What are you working on today? Stuck on anything?' // :TODO: (jmtaber129): Get this from meeting settings.
  })
}

export default createTeamPrompt
