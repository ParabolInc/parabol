import isValid from '../../isValid'
import {AddFeatureFlagToOrgSuccessResolvers} from '../resolverTypes'

export type AddFeatureFlagToOrgSuccessSource =
  | {updatedOrgIds: string[]}
  | {error: {message: string}}

const AddFeatureFlagToOrgSuccess: AddFeatureFlagToOrgSuccessResolvers = {
  updatedOrganizations: async (source, _args, {dataLoader}) => {
    if ('error' in source) return []
    const {updatedOrgIds} = source
    const organizations = await dataLoader.get('organizations').loadMany(updatedOrgIds)
    return organizations.filter(isValid)
  }
}

export default AddFeatureFlagToOrgSuccess
