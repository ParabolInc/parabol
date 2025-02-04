import {DemoOpenAISuccessResolvers} from '../resolverTypes'

export type DemoOpenAISuccessSource = {
  title: string
}

const DemoOpenAISuccess: DemoOpenAISuccessResolvers = {
  title: async ({title}, _args, {dataLoader}) => title
}

export default DemoOpenAISuccess
