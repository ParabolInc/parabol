import type {DataLoaderWorker} from '../../graphql/graphql'

export const isSyncedBlocksEnabled = async (userId: string, dataLoader: DataLoaderWorker) => {
  const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const flags = await Promise.all(
    organizationUsers.map(({orgId}) =>
      dataLoader.get('featureFlagByOwnerId').load({ownerId: orgId, featureName: 'SyncedBlocks'})
    )
  )
  return flags.some(Boolean)
}
