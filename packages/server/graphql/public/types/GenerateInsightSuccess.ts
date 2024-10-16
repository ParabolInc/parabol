import {GenerateInsightSuccessResolvers} from '../resolverTypes'

export type GenerateInsightSuccessSource = {
  teamId: string
}

const GenerateInsightSuccess: GenerateInsightSuccessResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return await dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default GenerateInsightSuccess
