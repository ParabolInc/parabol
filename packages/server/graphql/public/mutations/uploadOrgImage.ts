import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import normalizeAvatarUpload from '../../../fileStorage/normalizeAvatarUpload'
import validateAvatarUpload from '../../../fileStorage/validateAvatarUpload'
import {getUserId, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const uploadOrgImage: MutationResolvers['uploadOrgImage'] = async (
  _,
  {file, orgId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
    return standardError(new Error('Must be the organization leader'), {userId: viewerId})
  }

  // VALIDATION
  const {contentType, buffer: jsonBuffer} = file
  const buffer = Buffer.from(jsonBuffer.data)
  const [validExt, validBuffer] = await validateAvatarUpload(contentType, buffer)

  // RESOLUTION
  const [normalExt, normalBuffer] = await normalizeAvatarUpload(validExt, validBuffer)
  const manager = getFileStoreManager()
  const publicLocation = await manager.putOrgAvatar(normalBuffer, orgId, normalExt)

  await r
    .table('Organization')
    .get(orgId)
    .update({
      id: orgId,
      picture: publicLocation,
      updatedAt: now
    })
    .run()

  const data = {orgId}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateOrgPayload', data, subOptions)
  return data
}

export default uploadOrgImage
