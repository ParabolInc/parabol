import {PersistIntegrationSearchQuerySuccessResolvers} from '../resolverTypes'

export type PersistIntegrationSearchQuerySource =
  | {
  userId: string
  teamId: string
}
  | {error: {message: string}}

const PersistIntegrationSearchQueryPayload: PersistIntegrationSearchQuerySuccessResolvers = {}

export default PersistIntegrationSearchQueryPayload
