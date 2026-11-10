import {rule} from 'graphql-shield'
import {isSingleOrgInstance as isSingleOrg} from '../../../license/instanceLicense'

// IS_SINGLE_ORG, on an enterprise instance: no new organizations
export const isSingleOrgInstance = rule('isSingleOrgInstance', {cache: 'contextual'})(
  () => isSingleOrg() || new Error('This instance has a single organization')
)
