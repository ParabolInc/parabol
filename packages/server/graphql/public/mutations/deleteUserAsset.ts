import {GraphQLError} from 'graphql'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {Logger} from '../../../utils/Logger'
import type {MutationResolvers} from '../resolverTypes'
import {getUserAssetLocation} from './helpers/getUserAssetLocation'

const deleteUserAsset: MutationResolvers['deleteUserAsset'] = async (_source, {url}) => {
  const {partialPath} = getUserAssetLocation(url)
  const manager = await getFileStoreManager()
  try {
    await manager.deleteUserFile(partialPath)
  } catch (error) {
    Logger.warn(error)
    throw new GraphQLError('Could not delete the file', {
      extensions: {code: 'SERVICE_UNAVAILABLE'}
    })
  }
  return {url}
}

export default deleteUserAsset
