import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import addAgendaItemToActiveActionMeeting from '../../mutations/helpers/addAgendaItemToActiveActionMeeting'
import {MutationResolvers} from '../resolverTypes'

const addAgendaItem: MutationResolvers['addAgendaItem'] = async (
  _source,
  {newAgendaItem},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  // AUTH
  const {teamId} = newAgendaItem
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  // VALIDATION
  if (newAgendaItem.content.length > 64) {
    return {error: {message: 'Agenda item must be shorter'}}
  }

  // RESOLUTION
  const teamAgendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
  const lastAgendaItem = teamAgendaItems.at(-1)
  const agendaItemId = `${teamId}::${generateUID()}`
  await getKysely()
    .insertInto('AgendaItem')
    .values({
      id: agendaItemId,
      content: newAgendaItem.content,
      meetingId: newAgendaItem.meetingId,
      pinned: newAgendaItem.pinned,
      sortOrder: positionAfter(lastAgendaItem?.sortOrder ?? ''),
      teamId,
      teamMemberId: newAgendaItem.teamMemberId
    })
    .execute()
  const meetingId = await addAgendaItemToActiveActionMeeting(agendaItemId, teamId, dataLoader)
  analytics.addedAgendaItem(viewer, teamId, meetingId)
  const data = {agendaItemId, meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'AddAgendaItemPayload', data, subOptions)
  return data
}

export default addAgendaItem
