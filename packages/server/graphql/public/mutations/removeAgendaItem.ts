import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import removeStagesFromMeetings from '../../mutations/helpers/removeStagesFromMeetings'
import {MutationResolvers} from '../resolverTypes'

const removeAgendaItem: MutationResolvers['removeAgendaItem'] = async (
  _source,
  {agendaItemId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  // id is of format 'teamId::randomId'
  const [teamId] = agendaItemId.split('::') as [string]
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // RESOLUTION
  const agendaItem = await getKysely()
    .updateTable('AgendaItem')
    .set({isActive: false})
    .where('id', '=', agendaItemId)
    .returning(['id', 'meetingId'])
    .executeTakeFirst()
  if (!agendaItem) {
    return standardError(new Error('Agenda item not found'), {userId: viewerId})
  }
  const filterFn = (stage: AgendaItemsStage) => stage.agendaItemId === agendaItemId
  await removeStagesFromMeetings(filterFn, teamId, dataLoader)
  const data = {agendaItemId, meetingId: agendaItem.meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveAgendaItemPayload', data, subOptions)
  return data
}

export default removeAgendaItem
