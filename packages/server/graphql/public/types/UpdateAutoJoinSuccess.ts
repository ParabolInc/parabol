import isValid from '../../isValid'
import {UpdateAutoJoinSuccessResolvers} from '../resolverTypes'

export type UpdateAutoJoinSuccessSource = {
  updatedTeamIds: string[]
}

const UpdateAutoJoinSuccess: UpdateAutoJoinSuccessResolvers = {
  teams: async ({updatedTeamIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('teams').loadMany(updatedTeamIds)).filter(isValid)
  }
}

export default UpdateAutoJoinSuccess
