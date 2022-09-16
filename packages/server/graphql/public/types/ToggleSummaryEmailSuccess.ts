import {ToggleSummaryEmailSuccessResolvers} from '../resolverTypes'

export type ToggleSummaryEmailSuccessSource = {
  viewerId: string
}

const ToggleSummaryEmailSuccess: ToggleSummaryEmailSuccessResolvers = {
  user: async (src, _args, {dataLoader}) => {
    const {viewerId} = src
    console.log('🚀 ~ viewerId', {viewerId, src})
    const user = await dataLoader.get('users').load(viewerId)
    console.log('🚀 ~ user', user)
    return user
  }
}

export default ToggleSummaryEmailSuccess
