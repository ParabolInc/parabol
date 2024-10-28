import {InsertQueryBuilder} from 'kysely'
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
import AgendaItemsPhase from '../../../database/types/AgendaItemsPhase'
import CheckInPhase from '../../../database/types/CheckInPhase'
import CheckInStage from '../../../database/types/CheckInStage'
import DiscussPhase from '../../../database/types/DiscussPhase'
import EstimatePhase from '../../../database/types/EstimatePhase'
import GenericMeetingPhase from '../../../database/types/GenericMeetingPhase'
import ReflectPhase from '../../../database/types/ReflectPhase'
import TeamHealthPhase from '../../../database/types/TeamHealthPhase'
import TeamHealthStage from '../../../database/types/TeamHealthStage'
import UpdatesPhase from '../../../database/types/UpdatesPhase'
import UpdatesStage from '../../../database/types/UpdatesStage'
import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {NewMeetingPhase, NewMeetingStages} from '../../../postgres/types/NewMeetingPhase'
import {DB} from '../../../postgres/types/pg'
import isPhaseAvailable from '../../../utils/isPhaseAvailable'
import {DataLoaderWorker} from '../../graphql'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'

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

const getPastStageDurations = async (teamId: string, dataLoader: DataLoaderInstance) => {
  const completedMeetings = await dataLoader.get('completedMeetingsByTeamId').load(teamId)
  const phases = completedMeetings.flatMap((meeting) => meeting.phases as NewMeetingPhase[])
  const stages = phases
    .flatMap((phase) => phase.stages as NewMeetingStages[])
    .map((stage) => ({
      phaseType: stage.phaseType,
      duration:
        stage.startAt && stage.endAt
          ? new Date(stage.endAt).getTime() - new Date(stage.startAt).getTime()
          : 0
    }))
    .filter((stage) => stage.duration >= 60_000)
  return stages.reduce(
    (acc, stage) => {
      if (!acc[stage.phaseType]) {
        acc[stage.phaseType] = []
      }
      acc[stage.phaseType]!.push(stage.duration)
      return acc
    },
    {} as Record<string, number[]>
  )
}

const createNewMeetingPhases = async <T extends NewMeetingPhase = NewMeetingPhase>(
  facilitatorUserId: string,
  teamId: string,
  meetingId: string,
  meetingCount: number,
  meetingType: MeetingTypeEnum,
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  const [meetingSettings, stageDurations, team] = await Promise.all([
    dataLoader.get('meetingSettingsByType').load({teamId, meetingType}),
    getPastStageDurations(teamId, dataLoader),
    dataLoader.get('teams').loadNonNull(teamId)
  ])
  const {phaseTypes} = meetingSettings
  const facilitatorTeamMemberId = toTeamMemberId(teamId, facilitatorUserId)
  const inserts = [] as InsertQueryBuilder<DB, any, any>[]

  const tier = getFeatureTier(team)
  const phases = (await Promise.all(
    phaseTypes.filter(isPhaseAvailable(tier)).map(async (phaseType) => {
      const durations = stageDurations[phaseType]
      switch (phaseType) {
        case CHECKIN:
          return new CheckInPhase({
            teamId,
            meetingCount,
            stages: [new CheckInStage(facilitatorTeamMemberId)]
          })
        case 'TEAM_HEALTH':
          return new TeamHealthPhase({
            stages: [
              new TeamHealthStage('How are you feeling about work today?', ['😀', '😐', '😢'])
            ]
          })
        case REFLECT:
          return new ReflectPhase(teamId, durations)
        case DISCUSS:
          const discussPhase = new DiscussPhase(durations)
          const discussStages = discussPhase.stages.filter((stage) => stage.reflectionGroupId)
          if (discussStages.length > 0) {
            inserts.push(
              pg.insertInto('Discussion').values(
                discussStages.map((stage) => ({
                  id: stage.discussionId,
                  teamId,
                  meetingId,
                  discussionTopicId: stage.reflectionGroupId,
                  discussionTopicType: 'reflectionGroup'
                }))
              )
            )
          }
          return discussPhase
        case UPDATES:
          return new UpdatesPhase({durations, stages: [new UpdatesStage(facilitatorTeamMemberId)]})
        case AGENDA_ITEMS:
          const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
          const agendaItemIds = agendaItems.map(({id}) => id)
          const agendaItemPhase = new AgendaItemsPhase(agendaItemIds, durations)
          const {stages} = agendaItemPhase
          if (stages.length > 0) {
            inserts.push(
              pg.insertInto('Discussion').values(
                stages.map((stage) => ({
                  id: stage.discussionId,
                  teamId,
                  meetingId,
                  discussionTopicId: stage.agendaItemId,
                  discussionTopicType: 'agendaItem'
                }))
              )
            )
          }
          return agendaItemPhase
        case 'ESTIMATE':
          return new EstimatePhase()
        case GROUP:
        case VOTE:
        case FIRST_CALL:
        case LAST_CALL:
        case 'SCOPE':
          return new GenericMeetingPhase(phaseType, durations)
        default:
          throw new Error(`Unhandled phaseType: ${phaseType}`)
      }
    })
  )) as [T, ...T[]]
  primePhases(phases)
  return [phases, inserts] as const
}

export default createNewMeetingPhases
