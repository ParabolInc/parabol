import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

interface Subjects {
  userIds?: string[]
  orgIds?: string[]
  teamIds?: string[]
  emails?: string[]
  domain?: string
}

const updateFeatureFlag: MutationResolvers['updateFeatureFlag'] = async (
  _source,
  {flagName, subjects, description, expiresAt},
  {authToken, dataLoader}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const pg = getKysely()

  // AUTH
  const viewerId = getUserId(authToken)
  if (!isSuperUser(authToken)) {
    return standardError(new Error('Not authorized to update feature flag'), {userId: viewerId})
  }

  try {
    return await pg.transaction().execute(async (trx) => {
      // Update FeatureFlag
      const updatedFlag = await trx
        .updateTable('FeatureFlag')
        .set({
          description,
          expiresAt
        })
        .where('featureName', '=', flagName)
        .returning(['id', 'scope'])
        .executeTakeFirst()

      if (!updatedFlag) {
        throw new Error('Feature flag not found')
      }

      const {id: featureFlagId, scope} = updatedFlag

      // Resolve users from emails and domain
      const {userIds = [], orgIds = [], teamIds = [], emails = [], domain} = subjects
      let resolvedUserIds = [...userIds]

      if (emails.length > 0) {
        const usersByEmail = await getUsersByEmails(emails)
        resolvedUserIds.push(...usersByEmail.map((user) => user.id))
      }

      if (domain) {
        const usersByDomain = await getUsersByDomain(domain)
        resolvedUserIds.push(...usersByDomain.map((user) => user.id))
      }

      // Remove duplicates
      resolvedUserIds = [...new Set(resolvedUserIds)]

      // Update FeatureFlagOwner entries
      if (scope === 'User' && resolvedUserIds.length > 0) {
        await trx
          .insertInto('FeatureFlagOwner')
          .values(
            resolvedUserIds.map((userId) => ({
              featureFlagId,
              userId
            }))
          )
          .onConflict((oc) => oc.columns(['featureFlagId', 'userId']).doNothing())
          .execute()

        resolvedUserIds.forEach((userId) => {
          const data = {userId, flag: flagName}
          publish(
            SubscriptionChannel.NOTIFICATION,
            userId,
            'UpdateFeatureFlagPayload',
            data,
            subOptions
          )
        })
      } else if (scope === 'Organization' && orgIds.length > 0) {
        await trx
          .insertInto('FeatureFlagOwner')
          .values(
            orgIds.map((orgId) => ({
              featureFlagId,
              orgId
            }))
          )
          .onConflict((oc) => oc.columns(['featureFlagId', 'orgId']).doNothing())
          .execute()

        orgIds.forEach((orgId) => {
          const data = {orgId, flag: flagName}
          publish(
            SubscriptionChannel.ORGANIZATION,
            orgId,
            'UpdateFeatureFlagPayload',
            data,
            subOptions
          )
        })
      } else if (scope === 'Team' && teamIds.length > 0) {
        await trx
          .insertInto('FeatureFlagOwner')
          .values(
            teamIds.map((teamId) => ({
              featureFlagId,
              teamId
            }))
          )
          .onConflict((oc) => oc.columns(['featureFlagId', 'teamId']).doNothing())
          .execute()

        teamIds.forEach((teamId) => {
          const data = {teamId, flag: flagName}
          publish(SubscriptionChannel.TEAM, teamId, 'UpdateFeatureFlagPayload', data, subOptions)
        })
      }

      return {
        featureFlagId
      }
    })
  } catch (error) {
    console.error('Error updating feature flag:', error)
    return {error: {message: 'Failed to update feature flag'}}
  }
}

export default updateFeatureFlag
