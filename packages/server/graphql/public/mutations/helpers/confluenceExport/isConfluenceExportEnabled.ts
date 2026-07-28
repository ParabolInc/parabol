import type {DataLoaderWorker} from '../../../../graphql'

// Org-scoped flags are only granted via orgId rows, so check every org the user belongs to
export const isConfluenceExportEnabled = async (userId: string, dataLoader: DataLoaderWorker) => {
  const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const flags = await Promise.all(
    organizationUsers.map(({orgId}) =>
      dataLoader.get('featureFlagByOwnerId').load({ownerId: orgId, featureName: 'ConfluenceExport'})
    )
  )
  return flags.some(Boolean)
}
