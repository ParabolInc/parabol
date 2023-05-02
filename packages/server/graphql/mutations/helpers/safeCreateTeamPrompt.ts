import {ParabolR} from '../../../database/rethinkDriver'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import generateUID from '../../../generateUID'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {DataLoaderWorker} from '../../graphql'
import createNewMeetingPhases from './createNewMeetingPhases'

export const DEFAULT_PROMPT = 'What are you working on today? Stuck on anything?'

const safeCreateTeamPrompt = async (
  name: string,
  teamId: string,
  facilitatorId: string,
  r: ParabolR,
  dataLoader: DataLoaderWorker,
  meetingOverrideProps = {}
) => {
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
    name,
    teamId,
    meetingCount,
    phases,
    facilitatorUserId: facilitatorId,
    meetingPrompt: DEFAULT_PROMPT, // :TODO: (jmtaber129): Get this from meeting settings.
    ...meetingOverrideProps
  })
}

export default safeCreateTeamPrompt
