import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import normalizeAvatarUpload from '../../../fileStorage/normalizeAvatarUpload'
import validateAvatarUpload from '../../../fileStorage/validateAvatarUpload'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const uploadUserImage: MutationResolvers['uploadUserImage'] = async (
  _,
  {file},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
  const userId = getUserId(authToken)

  // VALIDATION
  const contentType = file.type
  const buffer = Buffer.from(await file.arrayBuffer())
  const [validExt, validBuffer] = await validateAvatarUpload(contentType, buffer)

  // RESOLUTION
  const [normalExt, normalBuffer] = await normalizeAvatarUpload(validExt, validBuffer)
  const manager = getFileStoreManager()
  const publicLocation = await manager.putUserAvatar(normalBuffer, userId, normalExt)

  await pg.updateTable('User').set({picture: publicLocation}).where('id', '=', userId).execute()
  dataLoader.clearAll(['users', 'teamMembers'])
  const teamMembers = await dataLoader.get('teamMembersByUserId').load(userId)
  const teamIds = teamMembers.map(({teamId}) => teamId)
  teamIds.forEach((teamId) => {
    const data = {userId, teamIds: [teamId]}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateUserProfilePayload', data, subOptions)
  })
  return {userId, teamIds}
}

export default uploadUserImage
