import {GetDemoGroupTitleSuccessResolvers} from '../resolverTypes'

export type GetDemoGroupTitleSuccessSource = {
  title: string
}

const GetDemoGroupTitleSuccess: GetDemoGroupTitleSuccessResolvers = {
  title: ({title}) => title
}

export default GetDemoGroupTitleSuccess
