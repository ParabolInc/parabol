import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import ms from 'ms'
import {PokerCards, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {MAX_FREE_JIRA_EXPORTS} from 'parabol-client/utils/constants'
// TODO: EstimateUserScore is from the deprecated /database directory
import EstimateUserScore from '../../../database/types/EstimateUserScore'
import getKysely from '../../../postgres/getKysely'
import type {PokerMeetingMember} from '../../../postgres/types/Meeting'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const pokerRevealVotes: MutationResolvers['pokerRevealVotes'] = async (
  _source,
  {meetingId, stageId, ignoreSuggestedUpgrade},
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
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const org = await dataLoader.get('organizations').loadNonNull(team.orgId)
  const {scores, serviceTaskId} = stage
  if (org.tier === 'starter') {
    const maybeCloudId = serviceTaskId.slice(0, serviceTaskId.indexOf(':'))
    const pg = getKysely()
    const jiraExport = await pg
      .selectFrom('JiraExport')
      .selectAll()
      .where('cloudId', '=', maybeCloudId)
      .executeTakeFirst()
    if (jiraExport && jiraExport.exportCount >= MAX_FREE_JIRA_EXPORTS) {
      const {limitReachedAt, exportCount} = jiraExport
      const yesterday = new Date(Date.now() - ms('1d'))
      const isHardError = limitReachedAt && limitReachedAt < yesterday
      const code = isHardError ? 'UPGRADE_REQUIRED' : 'UPGRADE_SUGGESTED'
      if (isHardError || !ignoreSuggestedUpgrade) {
        throw new GraphQLError(
          'Your free Jira export limit has been reached. Please upgrade to continue.',
          {
            extensions: {code, exportCount}
          }
        )
      }
    }
  }
  // RESOLUTION — add a pass card for everyone present but who didn't vote
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
