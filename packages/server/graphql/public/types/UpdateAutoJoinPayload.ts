import isValid from '../../isValid'
import type {UpdateAutoJoinPayloadResolvers} from '../resolverTypes'

export type UpdateAutoJoinPayloadSource = {
  updatedTeamIds: string[]
}

const UpdateAutoJoinPayload: UpdateAutoJoinPayloadResolvers = {
  updatedTeams: async ({updatedTeamIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('teams').loadMany(updatedTeamIds)).filter(isValid)
  }
}

export default UpdateAutoJoinPayload
