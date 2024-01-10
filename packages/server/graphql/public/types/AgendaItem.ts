import {AgendaItemResolvers} from '../resolverTypes'

const AgendaItem: AgendaItemResolvers = {
  isActive: ({isActive}) => !!isActive,
  teamMember: async ({teamMemberId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teamMembers').load(teamMemberId)
  }
}

export default AgendaItem
