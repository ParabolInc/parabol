import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import TeamPromptResponsesPhase from '../../../database/types/TeamPromptResponsesPhase'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import type {MeetingTypeEnum, TeamPromptMeeting} from '../../../postgres/types/Meeting'
import type {DataLoaderWorker} from '../../graphql'
import {primePhases} from './createNewMeetingPhases'

type TeamPromptOverrides = {
  templateId: string
  scheduledEndTime?: Date | null
  meetingSeriesId?: number
}

const safeCreateTeamPrompt = async (
  name: string,
  teamId: string,
  facilitatorId: string,
  dataLoader: DataLoaderWorker,
  overrides: TeamPromptOverrides
) => {
  const pg = getKysely()
  const meetingType: MeetingTypeEnum = 'teamPrompt'
  const {templateId, scheduledEndTime, meetingSeriesId} = overrides
  const [meetingCount, teamMembers, prompts] = await Promise.all([
    dataLoader.get('meetingCount').load({teamId, meetingType}),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    dataLoader.get('templatePromptsByTemplateId').load(templateId)
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
  const meeting = new MeetingTeamPrompt({
    id: meetingId,
    name,
    teamId,
    meetingCount,
    phases: [teamPromptResponsesPhase],
    facilitatorUserId: facilitatorId,
    meetingPrompt: prompts[0]!.question,
    templateId,
    meetingSeriesId,
    scheduledEndTime: scheduledEndTime ?? undefined
  }) as TeamPromptMeeting
  try {
    await pg
      .insertInto('NewMeeting')
      .values({...meeting, phases: JSON.stringify(meeting.phases)})
      .execute()
  } catch {
    // can't insert, meeting already exists?
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
