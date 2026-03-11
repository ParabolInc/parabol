import type {ReassignToCompanyClusterSuccessResolvers} from '../resolverTypes'

export type ReassignToCompanyClusterSuccessSource = {
  targetClusterId: number
  modifiedClusterIds: number[]
}

const ReassignToCompanyClusterSuccess: ReassignToCompanyClusterSuccessResolvers = {
  targetCluster: ({targetClusterId}) => ({id: targetClusterId}),
  modifiedClusters: ({modifiedClusterIds}) => modifiedClusterIds.map((id) => ({id}))
}

export default ReassignToCompanyClusterSuccess
