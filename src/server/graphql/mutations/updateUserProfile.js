import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import UpdateUserProfileInput from 'server/graphql/types/UpdateUserProfileInput'
import UpdateUserProfilePayload from 'server/graphql/types/UpdateUserProfilePayload'
import {getUserId, isAuthenticated} from 'server/utils/authorization'
import makeUserServerSchema from 'universal/validation/makeUserServerSchema'
import publish from 'server/utils/publish'
import {NOTIFICATION, TEAM_MEMBER} from 'universal/utils/constants'
import {sendSegmentIdentify} from 'server/utils/sendSegmentEvent'
import {JSDOM} from 'jsdom'
import sanitizeSVG from '@mattkrick/sanitize-svg'
import fetch from 'node-fetch'
import standardError from 'server/utils/standardError'

const updateUserProfile = {
  type: UpdateUserProfilePayload,
  args: {
    updatedUser: {
      type: new GraphQLNonNull(UpdateUserProfileInput),
      description: 'The input object containing the user profile fields that can be changed'
    }
  },
  async resolve(source, {updatedUser}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
    const userId = getUserId(authToken)

    // VALIDATION
    const schema = makeUserServerSchema()
    const {data: validUpdatedUser, errors} = schema(updatedUser)
    if (Object.keys(errors).length) {
      return standardError(new Error('Failed input validation'), {userId})
    }

    if (validUpdatedUser.picture && validUpdatedUser.picture.endsWith('.svg')) {
      const res = await fetch(validUpdatedUser.picture)
      const buffer = await res.buffer()
      const {window} = new JSDOM()
      const sanitaryPicture = await sanitizeSVG(buffer, window)
      if (!sanitaryPicture) {
        return {error: {message: 'Attempted Stored XSS attack', title: 'Uh oh'}}
      }
    }
    // RESOLUTION
    const updates = {
      ...validUpdatedUser,
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
