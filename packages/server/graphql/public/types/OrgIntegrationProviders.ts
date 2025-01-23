import OrgIntegrationProvidersId from '../../../../client/shared/gqlIds/OrgIntegrationProvidersId'
import {getUserId, isUserInOrg} from '../../../utils/authorization'
import {OrgIntegrationProvidersResolvers} from '../resolverTypes'

export type OrgIntegrationProvidersSource = {
  orgId: string
}
const OrgIntegrationProviders: OrgIntegrationProvidersResolvers = {
  id: ({orgId}) => OrgIntegrationProvidersId.join(orgId),

  gitlab: async ({orgId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    if (!(await isUserInOrg(viewerId, orgId, dataLoader))) return []
    const providers = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gitlab', orgIds: [orgId], teamIds: []})
    return providers.filter((provider) => provider.scope === 'org')
  }
}

export default OrgIntegrationProviders
