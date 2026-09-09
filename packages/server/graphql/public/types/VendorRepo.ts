import getVendorRepo from '../../../integrations/platform/getVendorRepo'
import type {VendorRepoResolvers} from '../resolverTypes'

const VendorRepo: VendorRepoResolvers = {
  __resolveType: (repo) => getVendorRepo(repo).typename(repo)
}

export default VendorRepo
