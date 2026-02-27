import type {UpdateTeamNamePayloadResolvers} from '../resolverTypes'

export type UpdateTeamNamePayloadSource = {teamId: string} | {error: {message: string}}

const UpdateTeamNamePayload: UpdateTeamNamePayloadResolvers = {
  team: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('teams').load(source.teamId)) ?? null
  }
}

export default UpdateTeamNamePayload
