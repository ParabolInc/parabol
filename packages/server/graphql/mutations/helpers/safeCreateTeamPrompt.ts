import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import TeamPromptResponsesPhase from '../../../database/types/TeamPromptResponsesPhase'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {MeetingTypeEnum, TeamPromptMeeting} from '../../../postgres/types/Meeting'
import {DataLoaderWorker} from '../../graphql'
import {primePhases} from './createNewMeetingPhases'

export const DEFAULT_PROMPT = 'What are you working on today? Stuck on anything?'

const safeCreateTeamPrompt = async (
  name: string,
  teamId: string,
  facilitatorId: string,
  dataLoader: DataLoaderWorker,
  meetingOverrideProps = {}
) => {
  const meetingType: MeetingTypeEnum = 'teamPrompt'
  const meetingCount = await dataLoader.get('meetingCount').load({teamId, meetingType})
  const meetingId = generateUID()
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const teamMemberIds = teamMembers.map(({id}) => id)
  const teamPromptResponsesPhase = new TeamPromptResponsesPhase(teamMemberIds)
  const {stages: teamPromptStages} = teamPromptResponsesPhase
  await getKysely()
    .insertInto('Discussion')
    .values(
      teamPromptStages.map((stage) => ({
        id: stage.discussionId,
        teamId,
        meetingId,
        discussionTopicId: stage.teamMemberId,
        discussionTopicType: 'teamPromptResponse'
      }))
    )
    .execute()
  primePhases([teamPromptResponsesPhase])
  return new MeetingTeamPrompt({
    id: meetingId,
    name,
    teamId,
    meetingCount,
    phases: [teamPromptResponsesPhase],
    facilitatorUserId: facilitatorId,
    meetingPrompt: DEFAULT_PROMPT, // :TODO: (jmtaber129): Get this from meeting settings.
    ...meetingOverrideProps
  }) as TeamPromptMeeting
}

export default safeCreateTeamPrompt
