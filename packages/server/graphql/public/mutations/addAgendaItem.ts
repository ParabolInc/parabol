import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import addAgendaItemToActiveActionMeeting from '../../mutations/helpers/addAgendaItemToActiveActionMeeting'
import type {MutationResolvers} from '../resolverTypes'

const addAgendaItem: MutationResolvers['addAgendaItem'] = async (
  _source,
  {newAgendaItem},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const {teamId} = newAgendaItem
  // VALIDATION
  if (newAgendaItem.content.length > 64) {
    throw new GraphQLError('Agenda item must be shorter', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const [teamMember, meeting] = await Promise.all([
    dataLoader.get('teamMembers').load(newAgendaItem.teamMemberId),
    newAgendaItem.meetingId ? dataLoader.get('newMeetings').load(newAgendaItem.meetingId) : null
  ])
  if (teamMember?.teamId !== teamId) {
    throw new GraphQLError('Team member is not on the team', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (newAgendaItem.meetingId && meeting?.teamId !== teamId) {
    throw new GraphQLError('Meeting does not belong to the team', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
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
  const data = {agendaItemId, meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'AddAgendaItemPayload', data, subOptions)
  return data
}

export default addAgendaItem
