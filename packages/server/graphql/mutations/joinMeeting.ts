import {GraphQLID, GraphQLNonNull} from 'graphql'
import {Insertable} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingMemberId from '../../../client/shared/gqlIds/MeetingMemberId'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import CheckInStage from '../../database/types/CheckInStage'
import TeamPromptResponseStage from '../../database/types/TeamPromptResponseStage'
import UpdatesStage from '../../database/types/UpdatesStage'
import getKysely from '../../postgres/getKysely'
import {TeamMember} from '../../postgres/types'
import {AnyMeeting} from '../../postgres/types/Meeting'
import {NewMeetingPhase, NewMeetingStages} from '../../postgres/types/NewMeetingPhase'
import {MeetingMember} from '../../postgres/types/pg'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import JoinMeetingPayload from '../types/JoinMeetingPayload'

export const createMeetingMember = (
  meeting: AnyMeeting,
  teamMember: Pick<TeamMember, 'userId' | 'teamId' | 'isSpectatingPoker'>
): Insertable<MeetingMember> => {
  const {userId, teamId, isSpectatingPoker} = teamMember
  const {id: meetingId, meetingType} = meeting
  return {
    id: MeetingMemberId.join(meetingId, userId),
    updatedAt: new Date(), // can remove this in phase 3
    teamId,
    userId,
    meetingId,
    meetingType,
    isSpectating: meetingType === 'poker' ? isSpectatingPoker : null,
    votesRemaining: meetingType === 'retrospective' ? meeting.totalVotes : null
  }
}

const joinMeeting = {
  type: new GraphQLNonNull(JoinMeetingPayload),
  description: `Create a meeting member for a user`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId}: {meetingId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const pg = getKysely()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    //AUTH
    const [meeting, viewer] = await Promise.all([
      dataLoader.get('newMeetings').load(meetingId),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
    if (!meeting) {
      return {error: {message: 'Invalid meeting ID'}}
    }
    const {endedAt, teamId, phases} = meeting
    if (endedAt) {
      return {error: {message: 'Meeting has already ended'}}
    }
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').loadNonNull(teamMemberId)
    const meetingMember = createMeetingMember(meeting, teamMember)
    try {
      await pg.insertInto('MeetingMember').values(meetingMember).execute()
    } catch {
      return {error: {message: 'Could not join meeting'}}
    }

    const addStageToPhase = async (
      stage: CheckInStage | UpdatesStage | TeamPromptResponseStage,
      phaseType: NewMeetingPhase['phaseType']
    ) => {
      await pg.transaction().execute(async (trx) => {
        const meeting = await trx
          .selectFrom('NewMeeting')
          .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
          .where('id', '=', meetingId)
          .forUpdate()
          // NewMeeting: add OrThrow in phase 3
          .executeTakeFirst()
        if (!meeting) return
        const {phases} = meeting
        const phase = getPhase(phases, phaseType)
        const stages = phase.stages as NewMeetingStages[]
        stages.push({
          ...stage,
          isNavigable: true,
          isNavigableByFacilitator: true,
          // the stage is complete if all other stages are complete & there's at least 1
          isComplete: stages.length >= 1 && stages.every((stage) => stage.isComplete)
        })
        await trx
          .updateTable('NewMeeting')
          .set({phases: JSON.stringify(phases)})
          .where('id', '=', meetingId)
          .execute()
      })
    }

    const appendToCheckin = async () => {
      const checkInPhase = getPhase(phases, 'checkin')
      if (!checkInPhase) return
      const checkInStage = new CheckInStage(teamMemberId)
      return addStageToPhase(checkInStage, 'checkin')
    }

    const appendToUpdate = async () => {
      const updatesPhase = getPhase(phases, 'updates')
      if (!updatesPhase) return
      const updatesStage = new UpdatesStage(teamMemberId)
      return addStageToPhase(updatesStage, 'updates')
    }

    const appendToTeamPromptResponses = async () => {
      const responsesPhase = getPhase(phases, 'RESPONSES')
      if (!responsesPhase) return
      const teamMemberResponseStage = responsesPhase.stages.find(
        (stage) => stage.teamMemberId === teamMemberId
      )
      // only add a new stage for the new users (ie. invited to the team after the meeting was started)
      if (teamMemberResponseStage) return
      const responsesStage = new TeamPromptResponseStage({teamMemberId})
      await getKysely()
        .insertInto('Discussion')
        .values({
          id: responsesStage.discussionId,
          teamId,
          meetingId,
          discussionTopicId: teamMemberId,
          discussionTopicType: 'teamPromptResponse'
        })
        .execute()
      return addStageToPhase(responsesStage, 'RESPONSES')
    }

    // effort is taken here to run both at the same time
    // so e.g.the 5th person in check-in is the 5th person in updates
    await Promise.all([appendToCheckin(), appendToUpdate(), appendToTeamPromptResponses()])
    dataLoader.clearAll('newMeetings')

    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'JoinMeetingSuccess', data, subOptions)
    analytics.meetingJoined(viewer, meeting)
    return data
  }
}

export default joinMeeting
