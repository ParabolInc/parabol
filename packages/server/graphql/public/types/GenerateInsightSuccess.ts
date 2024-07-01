// import {GenerateInsightSuccessResolvers} from '../resolverTypes'

export type GenerateInsightSuccessSource = {
  id: string
}

const GenerateInsightSuccess = {
  successField: async ({id}, _args, {dataLoader}) => {
    return null
  }
}

export default GenerateInsightSuccess
