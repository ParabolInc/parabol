import {sql} from 'kysely'
import {PokerCards, SubscriptionChannel} from 'parabol-client/types/constEnums'
// TODO: EstimateUserScore is from the deprecated /database directory
import EstimateUserScore from '../../../database/types/EstimateUserScore'
import getKysely from '../../../postgres/getKysely'
import type {PokerMeetingMember} from '../../../postgres/types/Meeting'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const pokerRevealVotes: MutationResolvers['pokerRevealVotes'] = async (
  _source,
  {meetingId, stageId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH — fetch meetingMembers early to reduce race condition window
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
  const {endedAt, phases, teamId, createdBy, facilitatorUserId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Not on the team'}}
  }
  if (endedAt) {
    return {error: {message: 'Meeting has ended'}}
  }
  if (viewerId !== facilitatorUserId) {
    if (viewerId !== createdBy) {
      return {error: {message: 'Not meeting facilitator'}}
    }
    return {error: {message: 'Not meeting facilitator anymore'}}
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

  // RESOLUTION — add a pass card for everyone present but who didn't vote
  const {scores} = stage
  meetingMembers.forEach((meetingMember) => {
    const {userId, isSpectating} = meetingMember as PokerMeetingMember
    if (isSpectating) return
    const userScore = scores.find((score) => score.userId === userId)
    if (!userScore) {
      const passScore = new EstimateUserScore({
        userId,
        label: PokerCards.PASS_CARD as string
      })
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

export default pokerRevealVotes
