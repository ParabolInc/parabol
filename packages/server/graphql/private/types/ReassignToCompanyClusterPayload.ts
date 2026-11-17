import type {ReassignToCompanyClusterPayloadResolvers} from '../resolverTypes'

export type ReassignToCompanyClusterPayloadSource = {
  targetClusterId: number
  modifiedClusterIds: number[]
}

const ReassignToCompanyClusterPayload: ReassignToCompanyClusterPayloadResolvers = {
  targetCluster: ({targetClusterId}) => ({id: targetClusterId}),
  modifiedClusters: ({modifiedClusterIds}) => modifiedClusterIds.map((id) => ({id}))
}

export default ReassignToCompanyClusterPayload
