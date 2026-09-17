import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import TeamPromptResponsesPhase from '../../../database/types/TeamPromptResponsesPhase'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import type {MeetingTypeEnum, TeamPromptMeeting} from '../../../postgres/types/Meeting'
import type {DataLoaderWorker} from '../../graphql'
import {primePhases} from './createNewMeetingPhases'
import getTeamPromptMeetingPrompts from './getTeamPromptMeetingPrompts'

export const DEFAULT_PROMPT = 'What are you working on today? Stuck on anything?'

type TeamPromptOverrides = {
  scheduledEndTime?: Date | null
  meetingSeriesId?: number
  meetingPrompt?: string
  templateId?: string | null
}

const safeCreateTeamPrompt = async (
  name: string,
  teamId: string,
  facilitatorId: string,
  dataLoader: DataLoaderWorker,
  overrides: TeamPromptOverrides = {}
) => {
  const pg = getKysely()
  const meetingType: MeetingTypeEnum = 'teamPrompt'
  const {templateId = null, meetingPrompt: legacyPrompt, ...meetingOverrideProps} = overrides
  const [meetingCount, teamMembers, prompts] = await Promise.all([
    dataLoader.get('meetingCount').load({teamId, meetingType}),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    getTeamPromptMeetingPrompts({templateId, createdAt: new Date()}, dataLoader)
  ])
  const meetingId = generateUID()
  const teamMemberIds = teamMembers.map(({id}) => id)
  const teamPromptResponsesPhase = new TeamPromptResponsesPhase(teamMemberIds)
  const {stages: teamPromptStages} = teamPromptResponsesPhase
  const discussions = teamPromptStages.map((stage) => ({
    id: stage.discussionId,
    teamId,
    meetingId,
    discussionTopicId: stage.teamMemberId,
    discussionTopicType: 'teamPromptResponse' as const
  }))
  primePhases([teamPromptResponsesPhase])
  const firstPrompt = prompts[0]
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    name,
    teamId,
    meetingCount,
    phases: [teamPromptResponsesPhase],
    facilitatorUserId: facilitatorId,
    meetingPrompt: firstPrompt?.question ?? legacyPrompt ?? DEFAULT_PROMPT,
    templateId: firstPrompt ? templateId : null,
    ...meetingOverrideProps
  }) as TeamPromptMeeting
  try {
    await pg
      .insertInto('NewMeeting')
      .values({...meeting, phases: JSON.stringify(meeting.phases)})
      .execute()
  } catch {
    // insert failed: a meeting for this team was just created concurrently
    return null
  }
  await pg
    .with('DiscussionInsert', (qb) => qb.insertInto('Discussion').values(discussions))
    .updateTable('Team')
    .set({lastMeetingType: 'teamPrompt'})
    .where('id', '=', teamId)
    .execute()
  return meeting
}

export default safeCreateTeamPrompt
