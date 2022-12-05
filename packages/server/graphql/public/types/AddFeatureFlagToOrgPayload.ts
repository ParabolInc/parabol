import isValid from '../../isValid'
import {AddFeatureFlagToOrgPayloadResolvers} from '../resolverTypes'

export type AddFeatureFlagToOrgPayloadSource = {orgIds: string[]} | {error: {message: string}}

const AddFeatureFlagToOrgPayload: AddFeatureFlagToOrgPayloadResolvers = {
  organizations: async (source, _args, {dataLoader}) => {
    if ('error' in source) return []
    const {orgIds} = source
    const organizations = await dataLoader.get('organizations').loadMany(orgIds)
    return organizations.filter(isValid)
  }
}

export default AddFeatureFlagToOrgPayload
