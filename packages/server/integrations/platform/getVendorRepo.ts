import type {VendorRepoIntegration} from './RemoteRepoIntegration'
import {getServerIntegration} from './registry'
import type {ServerIntegrationDefinition} from './ServerIntegrationDefinition'

/** The service's description of its own vendor records, for RepoContainer to delegate to */
const getVendorRepo = (repo: VendorRepoIntegration) => {
  const definition: ServerIntegrationDefinition = getServerIntegration(repo.service)
  const vendorRepo = definition.capabilities.repoList?.vendorRepo
  if (!vendorRepo) throw new Error(`${repo.service} repos are not vendor records`)
  return vendorRepo
}

export default getVendorRepo
