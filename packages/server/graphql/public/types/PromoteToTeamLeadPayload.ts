import type {PromoteToTeamLeadPayloadResolvers} from '../resolverTypes'

export type PromoteToTeamLeadPayloadSource = {
  teamId: string
  oldLeaderId: string
  newLeaderId: string
}

const PromoteToTeamLeadPayload: PromoteToTeamLeadPayloadResolvers = {
  team: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('teams').load(source.teamId)) ?? null
  },
  oldLeader: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('teamMembers').load(source.oldLeaderId)) ?? null
  },
  newLeader: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('teamMembers').load(source.newLeaderId)) ?? null
  }
}

export default PromoteToTeamLeadPayload
