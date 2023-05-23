import isValid from '../../isValid'
import {UpdateOrgFeatureFlagSuccessResolvers} from '../resolverTypes'

export type UpdateOrgFeatureFlagSuccessSource =
  | {updatedOrgIds: string[]}
  | {error: {message: string}}

const UpdateOrgFeatureFlagSuccess: UpdateOrgFeatureFlagSuccessResolvers = {
  updatedOrganizations: async (source, _args, {dataLoader}) => {
    if ('error' in source) return []
    const {updatedOrgIds} = source
    const organizations = await dataLoader.get('organizations').loadMany(updatedOrgIds)
    return organizations.filter(isValid)
  }
}

export default UpdateOrgFeatureFlagSuccess
