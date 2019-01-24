import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import UpdateUserProfileInput from 'server/graphql/types/UpdateUserProfileInput'
import UpdateUserProfilePayload from 'server/graphql/types/UpdateUserProfilePayload'
import {getUserId, isAuthenticated} from 'server/utils/authorization'
import makeUserServerSchema from 'universal/validation/makeUserServerSchema'
import publish from 'server/utils/publish'
import {NOTIFICATION, TEAM_MEMBER} from 'universal/utils/constants'
import {sendSegmentIdentify} from 'server/utils/sendSegmentEvent'
import {sendNotAuthenticatedAccessError} from 'server/utils/authorizationErrors'
import sendFailedInputValidation from 'server/utils/sendFailedInputValidation'
import shortid from 'shortid'
import mime from 'mime-types'
import {s3Upload} from 'server/utils/s3'

const updateUserProfile = {
  type: UpdateUserProfilePayload,
  args: {
    updatedUser: {
      type: new GraphQLNonNull(UpdateUserProfileInput),
      description: 'The input object containing the user profile fields that can be changed'
    }
  },
  async resolve (
    source,
    {updatedUser},
    {authToken, dataLoader, socketId: mutatorId, uploadManager}
  ) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    if (!isAuthenticated(authToken)) return sendNotAuthenticatedAccessError()
    const userId = getUserId(authToken)

    // VALIDATION
    const schema = makeUserServerSchema()
    const {data: validUpdatedUser, errors} = schema(updatedUser)
    if (Object.keys(errors).length) {
      return sendFailedInputValidation(authToken, errors)
    }

    const {picture, preferredName} = validUpdatedUser
    if (picture) {
      const {name, type} = picture
      let stream
      try {
        stream = await uploadManager.getStream(name)
      } catch (e) {
        return {error: {message: 'Upload timed out', title: 'Upload failed'}}
      }
      // VALIDATION
      const ext = mime.extension(type)
      if (!ext) {
        return {error: {message: 'Unknown image type', title: 'Upload failed'}}
      }

      // RESOLUTION
      const partialPath = `User/${userId}/picture/${shortid.generate()}.${ext}`
      console.log('getting stream for', partialPath)
      console.log('uploading stream to aws', stream)
      const promise = s3Upload(partialPath, stream)
      let res
      try {
        res = await promise
      } catch (e) {
        console.log('EERR uploading', e)
      }
      console.log('stream uploaded to aws', res)
      uploadManager.removeStream(name)
    }

    // RESOLUTION
    const updates = {
      picture: undefined,
      preferredName,
      updatedAt: now
    }
    // propagate denormalized changes to TeamMember
    const {user, teamMembers} = await r({
      teamMembers: r
        .table('TeamMember')
        .getAll(userId, {index: 'userId'})
        .update(updates, {returnChanges: true})('changes')('new_val')
        .default([]),
      user: r
        .table('User')
        .get(userId)
        .update(updates, {returnChanges: true})('changes')(0)('new_val')
        .default(null)
    })
    //
    // If we ever want to delete the previous profile images:
    //
    // const previousProfile = previousValue(dbProfileChanges);
    // if (previousProfile && urlIsPossiblyOnS3(previousProfile.picture)) {
    // // possible remove prior profile image from CDN asynchronously
    //   s3DeleteObject(previousProfile.picture)
    //   .catch(console.warn.bind(console));
    // }
    //
    await sendSegmentIdentify(user.id)
    const teamMemberIds = teamMembers.map(({id}) => id)
    const teamIds = teamMembers.map(({teamId}) => teamId)
    const data = {userId, teamMemberIds}
    teamIds.forEach((teamId) => {
      publish(TEAM_MEMBER, teamId, UpdateUserProfilePayload, data, subOptions)
    })
    publish(NOTIFICATION, userId, UpdateUserProfilePayload, data, subOptions)
    return data
  }
}

export default updateUserProfile
