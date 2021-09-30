import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import {getUserId, isSuperUser, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import removeStagesFromMeetings from '.././helpers/removeStagesFromMeetings'

async function resolve(_source, {agendaItemId}, {authToken, dataLoader, socketId: mutatorId}) {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  // id is of format 'teamId::randomId'
  const [teamId] = agendaItemId.split('::')
  if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // RESOLUTION
  const agendaItem = await r
    .table('AgendaItem')
    .get(agendaItemId)
    .update(
      {isActive: false},
      {returnChanges: true}
    )('changes')(0)('old_val')
    .default(null)
    .run()
  if (!agendaItem) {
    return standardError(new Error('Agenda item not found'), {userId: viewerId})
  }
  const filterFn = (stage: AgendaItemsStage) => stage.agendaItemId === agendaItemId
  await removeStagesFromMeetings(filterFn, teamId, dataLoader)
  const data = {agendaItem, meetingId: agendaItem.meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveAgendaItemPayload', data, subOptions)
  return data
}

export default resolve
