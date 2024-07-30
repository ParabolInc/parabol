import {AzureDevOpsSearchQueryResolvers} from '../resolverTypes'

const AzureDevOpsSearchQuery: AzureDevOpsSearchQueryResolvers = {
  isWIQL: ({isWIQL}) => !!isWIQL
}

export default AzureDevOpsSearchQuery
