import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import type {
  AnyMeeting,
  RetrospectiveMeeting,
  TeamHealthMeeting
} from '../../../postgres/types/Meeting'
import type {NewMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import toTeamHealthCheckResultStages from './toTeamHealthCheckResultStages'

const hasTeamHealthCheck = (meeting: AnyMeeting): meeting is RetrospectiveMeeting =>
  meeting.meetingType === 'retrospective' &&
  meeting.phases.some(({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK')

// a check revealed while the retro runs becomes the retro's to walk through, replacing any older
// results it held, unless the room is on those results right now. Locked, since a teammate joining
// the retro rewrites the same phases
const addRevealedResults = async (retroId: string, revealedCheck: TeamHealthMeeting) => {
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const retro = await trx
        .selectFrom('NewMeeting')
        .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
        .select(['createdAt', 'endedAt', 'facilitatorStageId'])
        .where('id', '=', retroId)
        .forUpdate()
        .executeTakeFirst()
      if (!retro || retro.endedAt) return
      if (!revealedCheck.endedAt || revealedCheck.endedAt < retro.createdAt) return
      const {phases, facilitatorStageId} = retro
      const resultPhase = getPhase(phases, 'TEAM_HEALTH_CHECK_RESULT')
      if (!resultPhase || resultPhase.stages[0]?.teamHealthMeetingId === revealedCheck.id) return
      const resultPhaseIndex = phases.indexOf(resultPhase)
      const facilitatorPhaseIndex = phases.findIndex(({stages}) =>
        stages.some(({id}) => id === facilitatorStageId)
      )
      if (facilitatorPhaseIndex === resultPhaseIndex) return
      // the results unlock the way navigating would have left them
      const isBehindRoom = facilitatorPhaseIndex > resultPhaseIndex
      resultPhase.stages = toTeamHealthCheckResultStages(revealedCheck, {
        isNavigable: isBehindRoom,
        isNavigableByFacilitator: isBehindRoom || facilitatorPhaseIndex === resultPhaseIndex - 1
      })
      await trx
        .updateTable('NewMeeting')
        .set({phases: JSON.stringify(phases)})
        .where('id', '=', retroId)
        .execute()
    })
}

// a retro resolves its team's open check live, so whenever a check opens or ends, the team's running
// retros are told to read it again. Detached from the caller, so it reads through a loader of its own
const syncRetrosWithTeamHealthCheck = async (
  teamId: string,
  revealedTeamHealthMeetingId?: string
) => {
  const dataLoader = getNewDataLoader('syncRetrosWithTeamHealthCheck')
  try {
    const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const retros = activeMeetings.filter(hasTeamHealthCheck)
    if (retros.length === 0) return
    const revealedCheck = revealedTeamHealthMeetingId
      ? await dataLoader.get('newMeetings').load(revealedTeamHealthMeetingId)
      : null
    if (revealedCheck?.meetingType === 'teamHealth') {
      await Promise.all(retros.map(({id}) => addRevealedResults(id, revealedCheck)))
      dataLoader.clearAll('newMeetings')
    }
    const operationId = dataLoader.share()
    retros.forEach(({id: meetingId}) => {
      // no mutatorId: whoever opened or ended the check gets no retro back from their own mutation
      publish(
        SubscriptionChannel.MEETING,
        meetingId,
        'RetroTeamHealthCheckPayload',
        {meetingId},
        {operationId}
      )
    })
  } finally {
    dataLoader.dispose()
  }
}

export default syncRetrosWithTeamHealthCheck
