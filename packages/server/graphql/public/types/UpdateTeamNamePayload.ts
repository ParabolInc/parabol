import type {UpdateTeamNamePayloadResolvers} from '../resolverTypes'

export type UpdateTeamNamePayloadSource = {teamId: string}

const UpdateTeamNamePayload: UpdateTeamNamePayloadResolvers = {
  team: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('teams').load(source.teamId)) ?? null
  }
}

export default UpdateTeamNamePayload
