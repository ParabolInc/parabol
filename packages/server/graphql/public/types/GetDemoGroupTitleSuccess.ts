import {GetDemoGroupTitleSuccessResolvers} from '../resolverTypes'

export type GetDemoGroupTitleSuccessSource = {
  title: string
}

const GetDemoGroupTitleSuccess: GetDemoGroupTitleSuccessResolvers = {
  title: async ({title}, _args, {dataLoader}) => title
}

export default GetDemoGroupTitleSuccess
