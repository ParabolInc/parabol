import {UpdateAutoJoinSuccessResolvers} from '../resolverTypes'

export type UpdateAutoJoinSuccessSource = {
  teamIds: string[]
}

const UpdateAutoJoinSuccess: UpdateAutoJoinSuccessResolvers = {
  teams: async ({teamIds}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadMany(teamIds)
  }
}

export default UpdateAutoJoinSuccess
