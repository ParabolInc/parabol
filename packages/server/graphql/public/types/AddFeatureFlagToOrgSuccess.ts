import isValid from '../../isValid'
import {AddFeatureFlagToOrgSuccessResolvers} from '../resolverTypes'

export type AddFeatureFlagToOrgSuccessSource = {orgIds: string[]} | {error: {message: string}}

const AddFeatureFlagToOrgSuccess: AddFeatureFlagToOrgSuccessResolvers = {
  organizations: async (source, _args, {dataLoader}) => {
    if ('error' in source) return []
    const {orgIds} = source
    const organizations = await dataLoader.get('organizations').loadMany(orgIds)
    return organizations.filter(isValid)
  }
}

export default AddFeatureFlagToOrgSuccess
