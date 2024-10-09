import {GraphQLID, GraphQLNonNull} from 'graphql'
import {sql} from 'kysely'
import {PokerCards, SubscriptionChannel} from 'parabol-client/types/constEnums'
import EstimateUserScore from '../../database/types/EstimateUserScore'
import getKysely from '../../postgres/getKysely'
import {PokerMeetingMember} from '../../postgres/types/Meeting'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import PokerRevealVotesPayload from '../types/PokerRevealVotesPayload'

const pokerRevealVotes = {
  type: new GraphQLNonNull(PokerRevealVotesPayload),
  description: 'Progresses the stage dimension to the reveal & discuss step',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId, stageId}: {meetingId: string; stageId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const pg = getKysely()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH

    // fetch meetingMembers up here to reduce chance of race condition that a vote gets cast in between now & when we update the scores
    const [meetingMembers, meeting] = await Promise.all([
      dataLoader.get('meetingMembersByMeetingId').load(meetingId),
      dataLoader.get('newMeetings').load(meetingId)
    ])

    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    if (meeting.meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
    }
    const {endedAt, phases, meetingType, teamId, createdBy, facilitatorUserId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    if (endedAt) {
      return {error: {message: 'Meeting has ended'}}
    }
    if (meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
    }
    if (viewerId !== facilitatorUserId) {
      if (viewerId !== createdBy) {
        return {
          error: {message: 'Not meeting facilitator'}
        }
      }
      return {
        error: {message: 'Not meeting facilitator anymore'}
      }
    }

    // VALIDATION
    const estimatePhase = getPhase(phases, 'ESTIMATE')
    const estimatePhaseIdx = phases.indexOf(estimatePhase)
    const {stages} = estimatePhase
    const stageIdx = stages.findIndex((stage) => stage.id === stageId)
    const stage = stages[stageIdx]
    if (!stage) {
      return {error: {message: 'Invalid stageId provided'}}
    }

    // RESOLUTION
    // add a pass card for everyone who was present but did not vote
    const {scores} = stage
    meetingMembers.forEach((meetingMember) => {
      const {userId, isSpectating} = meetingMember as PokerMeetingMember
      if (isSpectating) return
      const userScore = scores.find((score) => score.userId === userId)
      if (!userScore) {
        const passScore = new EstimateUserScore({userId, label: PokerCards.PASS_CARD as string})
        scores.push(passScore)
      }
    })

    stage.isVoting = false
    await pg
      .updateTable('NewMeeting')
      .set({
        phases: sql`jsonb_set(
            jsonb_set(phases, ${sql.lit(`{${estimatePhaseIdx},stages,${stageIdx},"scores"}`)}, ${JSON.stringify(scores)}::jsonb, false),
            ${sql.lit(`{${estimatePhaseIdx},stages,${stageIdx},"isVoting"}`)}, 'false'::jsonb, false
          )`
      })
      .where('id', '=', meetingId)
      .execute()
    dataLoader.clearAll('newMeetings')
    const data = {meetingId, stageId}
    publish(SubscriptionChannel.MEETING, meetingId, 'PokerRevealVotesSuccess', data, subOptions)
    return data
  }
}

export default pokerRevealVotes
