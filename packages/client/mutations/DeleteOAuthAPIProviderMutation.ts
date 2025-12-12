import type {OrganizationSubscription} from '../__generated__/OrganizationSubscription.graphql'
import {SharedUpdater} from '../types/relayMutations'

type DeleteOAuthAPIProviderSuccessPayload = NonNullable<
  OrganizationSubscription['response']['organizationSubscription']
>['DeleteOAuthAPIProviderSuccess']

export const deleteOAuthAPIProviderOrganizationUpdater: SharedUpdater<
  DeleteOAuthAPIProviderSuccessPayload
> = (payload, {store}) => {
  if (!payload) return

  const deletedProviderId = payload.getValue('providerId') || payload.getValue('deletedProviderId')

  if (!deletedProviderId) return

  const organizationProxy = payload.getLinkedRecord('organization')
  const orgId = organizationProxy?.getValue('id')

  if (!orgId || typeof orgId !== 'string') return

  const orgRecord = store.get(orgId)
  if (!orgRecord) return

  const providers = orgRecord.getLinkedRecords('oauthProviders')
  if (!providers) return

  const newProviders = providers.filter((p) => p.getDataID() !== deletedProviderId)
  orgRecord.setLinkedRecords(newProviders, 'oauthProviders')
}
