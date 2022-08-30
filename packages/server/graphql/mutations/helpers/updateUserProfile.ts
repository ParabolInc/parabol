import sanitizeSVG from '@mattkrick/sanitize-svg'
import {JSDOM} from 'jsdom'
import fetch from 'node-fetch'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import linkify from 'parabol-client/utils/linkify'
import makeUserServerSchema from 'parabol-client/validation/makeUserServerSchema'
import getRethink from '../../../database/rethinkDriver'
import TeamMember from '../../../database/types/TeamMember'
import updateUser from '../../../postgres/queries/updateUser'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import segmentIo from '../../../utils/segmentIo'
import standardError from '../../../utils/standardError'
import {UpdateUserProfileInputType} from '../../types/UpdateUserProfileInput'
import {GQLContext} from './../../graphql'

const updateUserProfile = async (
  _source: unknown,
  {updatedUser}: {updatedUser: UpdateUserProfileInputType},
  {authToken, dataLoader, socketId: mutatorId}: GQLContext
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
  const userId = getUserId(authToken)

  // VALIDATION
  const schema = makeUserServerSchema()
  const {data: validUpdatedUser, errors}: {data: UpdateUserProfileInputType; errors: any[]} =
    schema(updatedUser) as any
  if (Object.keys(errors).length) {
    return standardError(new Error('Failed input validation'), {userId})
  }

  if (validUpdatedUser.picture && validUpdatedUser.picture.endsWith('.svg')) {
    const res = await fetch(validUpdatedUser.picture)
    const buffer = await res.buffer()
    const {window} = new JSDOM()
    const sanitaryPicture = await sanitizeSVG(buffer, window as any)
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
  // propagate denormalized changes to TeamMember
  const updateObj = {
    picture: validUpdatedUser.picture ?? undefined,
    preferredName: validUpdatedUser.preferredName ?? undefined
  }
  const [teamMembers] = await Promise.all([
    r
      .table('TeamMember')
      .getAll(userId, {index: 'userId'})
      .update(updateObj, {returnChanges: true})('changes')('new_val')
      .default([])
      .run() as unknown as TeamMember[],
    updateUser(updateObj, userId)
  ])
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
  if (validUpdatedUser.preferredName) {
    segmentIo.track({
      userId,
      event: 'Changed name',
      properties: {
        name: validUpdatedUser.preferredName
      }
    })
  }

  const teamIds = teamMembers.map(({teamId}) => teamId)
  teamIds.forEach((teamId) => {
    const data = {userId, teamIds: [teamId]}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateUserProfilePayload', data, subOptions)
  })
  return {userId, teamIds}
}

export default updateUserProfile
