import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const revealTeamHealthVotes: MutationResolvers['revealTeamHealthVotes'] = async (
  _source,
  {meetingId, stageId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  //AUTH
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {endedAt, phases, teamId} = meeting
  if (endedAt) {
    return {error: {message: 'Meeting has ended'}}
  }

  // VALIDATION
  const teamHealthPhase = getPhase(phases, 'TEAM_HEALTH')
  const {stages} = teamHealthPhase
  const stageIdx = stages.findIndex((stage) => stage.id === stageId)
  const phaseIdx = phases.indexOf(teamHealthPhase)
  const stage = stages[stageIdx]

  if (!stage || stage.phaseType !== 'TEAM_HEALTH' || stageIdx < 0 || phaseIdx < 0) {
    return {error: {message: 'Invalid stageId provided'}}
  }
  if (stage.isRevealed) {
    return {error: {message: 'Votes are already revealed'}}
  }

  await pg
    .updateTable('NewMeeting')
    .set({
      phases: sql`jsonb_set(phases, ${sql.lit(`{${phaseIdx},stages,${stageIdx},"isRevealed"}`)}, 'true'::jsonb, false)`
    })
    .where('id', '=', meetingId)
    .execute()
  stage.isRevealed = true

  const data = {
    meetingId,
    stageId,
    teamId,
    stage: {
      ...stage,
      meetingId,
      teamId
    }
  }

  publish(SubscriptionChannel.MEETING, meetingId, 'RevealTeamHealthVotesSuccess', data, subOptions)

  return data
}

export default revealTeamHealthVotes
