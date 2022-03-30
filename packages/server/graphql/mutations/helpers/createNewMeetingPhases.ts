import {
  AGENDA_ITEMS,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  REFLECT,
  UPDATES,
  VOTE
} from 'parabol-client/utils/constants'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import AgendaItemsPhase from '../../../database/types/AgendaItemsPhase'
import CheckInPhase from '../../../database/types/CheckInPhase'
import CheckInStage from '../../../database/types/CheckInStage'
import DiscussPhase from '../../../database/types/DiscussPhase'
import EstimatePhase from '../../../database/types/EstimatePhase'
import GenericMeetingPhase from '../../../database/types/GenericMeetingPhase'
import TeamPromptResponsesPhase from '../../../database/types/TeamPromptResponsesPhase'
import ReflectPhase from '../../../database/types/ReflectPhase'
import UpdatesPhase from '../../../database/types/UpdatesPhase'
import UpdatesStage from '../../../database/types/UpdatesStage'
import insertDiscussions from '../../../postgres/queries/insertDiscussions'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {DataLoaderWorker} from '../../graphql'

export const primePhases = (phases: GenericMeetingPhase[], startIndex = 0) => {
  const [firstPhase, secondPhase] = [phases[startIndex], phases[startIndex + 1]]
  if (firstPhase && firstPhase.stages[0]) {
    firstPhase.stages[0].startAt = new Date()
    firstPhase.stages.forEach((stage) => {
      stage.isNavigable = true
      stage.isNavigableByFacilitator = true
    })
  }
  if (secondPhase?.stages[0]) {
    secondPhase.stages[0].isNavigableByFacilitator = true
  }
}

const getPastStageDurations = async (teamId: string) => {
  const r = await getRethink()
  return (
    r
      .table('NewMeeting')
      .getAll(teamId, {index: 'teamId'})
      .filter({isLegacy: false}, {default: true})
      // .orderBy(r.desc('endedAt'))
      .concatMap((row: RValue) => row('phases'))
      .concatMap((row: RValue) => row('stages'))
      .filter((row: RValue) => row.hasFields('startAt', 'endAt'))
      // convert seconds to ms
      .merge((row: RValue) => ({
        duration: r.sub(row('endAt'), row('startAt')).mul(1000).floor()
      }))
      // remove stages that took under 1 minute
      .filter((row: RValue) => row('duration').ge(60000))
      .orderBy(r.desc('startAt'))
      .group('phaseType')
      .ungroup()
      .map((row) => [row('group'), row('reduction')('duration')])
      .coerceTo('object')
      .run() as unknown as {[key: string]: number[]}
  )
}

const createNewMeetingPhases = async (
  facilitatorUserId: string,
  teamId: string,
  meetingId: string,
  meetingCount: number,
  meetingType: MeetingTypeEnum,
  dataLoader: DataLoaderWorker
) => {
  const [meetingSettings, stageDurations] = await Promise.all([
    dataLoader.get('meetingSettingsByType').load({teamId, meetingType}),
    getPastStageDurations(teamId)
  ])
  const {phaseTypes} = meetingSettings
  const facilitatorTeamMemberId = toTeamMemberId(teamId, facilitatorUserId)
  const asyncSideEffects = [] as Promise<any>[]

  const phases = (await Promise.all(
    phaseTypes.map(async (phaseType) => {
      const durations = stageDurations[phaseType]
      switch (phaseType) {
        case CHECKIN:
          return new CheckInPhase({
            teamId,
            meetingCount,
            stages: [new CheckInStage(facilitatorTeamMemberId)]
          })
        case REFLECT:
          return new ReflectPhase(teamId, durations)
        case DISCUSS:
          const discussPhase = new DiscussPhase(durations)
          const discussStages = discussPhase.stages.filter((stage) => stage.reflectionGroupId)
          asyncSideEffects.push(
            insertDiscussions(
              discussStages.map((stage) => ({
                id: stage.discussionId,
                teamId,
                meetingId,
                discussionTopicId: stage.reflectionGroupId,
                discussionTopicType: 'reflectionGroup' as const
              }))
            )
          )
          return discussPhase
        case UPDATES:
          return new UpdatesPhase({durations, stages: [new UpdatesStage(facilitatorTeamMemberId)]})
        case AGENDA_ITEMS:
          const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
          const agendaItemIds = agendaItems.map(({id}) => id)
          const agendaItemPhase = new AgendaItemsPhase(agendaItemIds, durations)
          const {stages} = agendaItemPhase
          const discussions = stages.map((stage) => ({
            id: stage.discussionId,
            teamId,
            meetingId,
            discussionTopicId: stage.agendaItemId,
            discussionTopicType: 'agendaItem' as const
          }))
          asyncSideEffects.push(insertDiscussions(discussions))
          return agendaItemPhase
        case 'ESTIMATE':
          return new EstimatePhase()
        case GROUP:
        case VOTE:
        case FIRST_CALL:
        case LAST_CALL:
        case 'SCOPE':
          return new GenericMeetingPhase(phaseType, durations)
        case 'RESPONSES':
          const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
          const teamMemberIds = teamMembers.map(({id}) => id)
          const teamPromptResponsesPhase = new TeamPromptResponsesPhase(teamMemberIds)
          const {stages: teamPromptStages} = teamPromptResponsesPhase
          const teamMemberResponseDiscussion = teamPromptStages.map((stage) => ({
            id: stage.discussionId,
            teamId,
            meetingId,
            discussionTopicId: stage.teamMemberId,
            discussionTopicType: 'teamPromptResponse' as const
          }))
          asyncSideEffects.push(insertDiscussions(teamMemberResponseDiscussion))
          return teamPromptResponsesPhase
        default:
          throw new Error(`Unhandled phaseType: ${phaseType}`)
      }
    })
  )) as [GenericMeetingPhase, ...GenericMeetingPhase[]]
  primePhases(phases)
  await Promise.all(asyncSideEffects)
  return phases
}

export default createNewMeetingPhases
