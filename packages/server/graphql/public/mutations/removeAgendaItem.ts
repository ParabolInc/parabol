import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import type AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import removeStagesFromMeetings from '../../mutations/helpers/removeStagesFromMeetings'
import type {MutationResolvers} from '../resolverTypes'

const removeAgendaItem: MutationResolvers['removeAgendaItem'] = async (
  _source,
  {agendaItemId},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // id is of format 'teamId::randomId'
  const [teamId] = agendaItemId.split('::') as [string]

  // RESOLUTION
  const agendaItem = await getKysely()
    .updateTable('AgendaItem')
    .set({isActive: false})
    .where('id', '=', agendaItemId)
    .returning(['id', 'meetingId'])
    .executeTakeFirst()
  if (!agendaItem) {
    throw new GraphQLError('Agenda item not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const filterFn = (stage: AgendaItemsStage) => stage.agendaItemId === agendaItemId
  await removeStagesFromMeetings(filterFn, teamId, dataLoader)
  const data = {agendaItemId, meetingId: agendaItem.meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveAgendaItemPayload', data, subOptions)
  return data
}

export default removeAgendaItem
