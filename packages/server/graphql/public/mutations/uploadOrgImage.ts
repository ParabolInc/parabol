import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import normalizeAvatarUpload from '../../../fileStorage/normalizeAvatarUpload'
import validateAvatarUpload from '../../../fileStorage/validateAvatarUpload'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const uploadOrgImage: MutationResolvers['uploadOrgImage'] = async (
  _,
  {file, orgId},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const contentType = file.type
  const buffer = Buffer.from(await file.arrayBuffer())
  const [validExt, validBuffer] = await validateAvatarUpload(contentType, buffer)

  // RESOLUTION
  const [normalExt, normalBuffer] = await normalizeAvatarUpload(validExt, validBuffer)
  const manager = getFileStoreManager()
  const publicLocation = await manager.putOrgAvatar(normalBuffer, orgId, normalExt)
  await getKysely()
    .updateTable('Organization')
    .set({picture: publicLocation})
    .where('id', '=', orgId)
    .execute()

  const data = {orgId}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateOrgPayload', data, subOptions)
  return data
}

export default uploadOrgImage
