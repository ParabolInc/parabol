import {DraftEnterpriseInvoicePayloadResolvers} from '../resolverTypes'

const _xGitHubRepository: DraftEnterpriseInvoicePayloadResolvers = {
  __interfaces: () => ['RepoIntegration'],
  __isTypeOf: ({nameWithOwner}: {nameWithOwner?: string}) => !!nameWithOwner,
  service: () => 'github'
}

export default _xGitHubRepository
