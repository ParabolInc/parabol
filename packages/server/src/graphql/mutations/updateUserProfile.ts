import {GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import UpdateUserProfileInput from '../types/UpdateUserProfileInput'
import UpdateUserProfilePayload from '../types/UpdateUserProfilePayload'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import makeUserServerSchema from 'parabol-client/lib/validation/makeUserServerSchema'
import publish from '../../utils/publish'
import {sendSegmentIdentify} from '../../utils/sendSegmentEvent'
import {JSDOM} from 'jsdom'
import sanitizeSVG from '@mattkrick/sanitize-svg'
import fetch from 'node-fetch'
import standardError from '../../utils/standardError'
import linkify from 'parabol-client/lib/utils/linkify'
import User from '../../database/types/User'
import {ITeamMember} from 'parabol-client/lib/types/graphql'
import {SubscriptionChannel} from 'parabol-client/lib/types/constEnums'

const updateUserProfile = {
  type: UpdateUserProfilePayload,
  args: {
    updatedUser: {
      type: new GraphQLNonNull(UpdateUserProfileInput),
      description: 'The input object containing the user profile fields that can be changed'
    }
  },
  async resolve(_source, {updatedUser}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
    const userId = getUserId(authToken)

    // VALIDATION
    const schema = makeUserServerSchema()
    const {data: validUpdatedUser, errors} = schema(updatedUser) as any
    if (Object.keys(errors).length) {
      return standardError(new Error('Failed input validation'), {userId})
    }

    if (validUpdatedUser.picture && validUpdatedUser.picture.endsWith('.svg')) {
      const res = await fetch(validUpdatedUser.picture)
      const buffer = await res.buffer()
      const {window} = new JSDOM()
      const sanitaryPicture = await sanitizeSVG(buffer, window)
      if (!sanitaryPicture) {
        return {error: {message: 'Attempted Stored XSS attack'}}
      }
    }

    if (validUpdatedUser.preferredName) {
      const links = linkify.match(validUpdatedUser.preferredName)
      if (links) {
        return {
          error: {message: 'Name cannot be a hyperlink'}
        }
      }
    }

    // RESOLUTION
    const updates = {
      ...validUpdatedUser,
      updatedAt: now
    }
    // propagate denormalized changes to TeamMember
    const {user, teamMembers} = await r({
      teamMembers: (r
        .table('TeamMember')
        .getAll(userId, {index: 'userId'})
        .update(updates, {returnChanges: true})('changes')('new_val')
        .default([]) as unknown) as ITeamMember[],
      user: (r
        .table('User')
        .get(userId)
        .update(updates, {returnChanges: true})('changes')(0)('new_val')
        .default(null) as unknown) as User
    }).run()
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
    const teamIds = teamMembers.map(({teamId}) => teamId)
    teamIds.forEach((teamId) => {
      const data = {userId, teamIds: [teamId]}
      publish(SubscriptionChannel.TEAM, teamId, 'UpdateUserProfilePayload', data, subOptions)
    })
    return {userId, teamIds}
  }
}

export default updateUserProfile
