import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import normalizeAvatarUpload from '../../../fileStorage/normalizeAvatarUpload'
import validateAvatarUpload from '../../../fileStorage/validateAvatarUpload'
import getKysely from '../../../postgres/getKysely'
import updateUser from '../../../postgres/queries/updateUser'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers, TeamMember} from '../resolverTypes'

const uploadUserImage: MutationResolvers['uploadUserImage'] = async (
  _,
  {file},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
  const userId = getUserId(authToken)

  // VALIDATION
  const {contentType, buffer: jsonBuffer} = file
  const buffer = Buffer.from(jsonBuffer.data)
  const [validExt, validBuffer] = await validateAvatarUpload(contentType, buffer)

  // RESOLUTION
  const [normalExt, normalBuffer] = await normalizeAvatarUpload(validExt, validBuffer)
  const manager = getFileStoreManager()
  const publicLocation = await manager.putUserAvatar(normalBuffer, userId, normalExt)

  await Promise.all([
    pg
      .with('TeamMemberUpdate', (qc) =>
        qc.updateTable('TeamMember').set({picture: publicLocation}).where('userId', '=', userId)
      )
      .updateTable('User')
      .set({picture: publicLocation})
      .where('id', '=', userId)
      .execute(),
    r
      .table('TeamMember')
      .getAll(userId, {index: 'userId'})
      .update({picture: publicLocation}, {returnChanges: true})('changes')('new_val')
      .default([])
      .run() as unknown as TeamMember[],

    updateUser({picture: publicLocation}, userId)
  ])
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
