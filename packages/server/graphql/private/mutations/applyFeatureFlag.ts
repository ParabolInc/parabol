import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getFeatureFlag} from '../../../utils/featureFlags'
import isValid from '../../isValid'
import type {MutationResolvers} from '../resolverTypes'

const applyFeatureFlag: MutationResolvers['applyFeatureFlag'] = async (
  _source,
  {flagName, subjects},
  {dataLoader}
) => {
  const pg = getKysely()

  const subjectKeys = Object.keys(subjects)

  if (subjectKeys.length === 0) {
    throw new GraphQLError('At least one subject type must be provided', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const featureFlag = getFeatureFlag(flagName)

  if (!featureFlag) {
    throw new GraphQLError('Feature flag not found', {extensions: {code: 'NOT_FOUND'}})
  }

  const {featureName, scope} = featureFlag

  const userIds: string[] = []
  const teamIds: string[] = []
  const orgIds: string[] = []

  if (scope === 'User') {
    if (subjects.emails) {
      const users = await getUsersByEmails(subjects.emails)
      userIds.push(...users.map((user) => user.id))
    }

    if (subjects.domains) {
      for (const domain of subjects.domains) {
        const domainUsers = await getUsersByDomain(domain)
        userIds.push(...domainUsers.map((user) => user.id))
      }
    }

    if (subjects.userIds) {
      userIds.push(...subjects.userIds)
    }
  } else if (scope === 'Team') {
    if (subjects.teamIds) {
      teamIds.push(...subjects.teamIds)
    }
  } else if (scope === 'Organization') {
    if (subjects.orgIds) {
      orgIds.push(...subjects.orgIds)
    }
  }

  const values =
    scope === 'User'
      ? userIds.map((userId) => ({userId, featureName}))
      : scope === 'Team'
        ? teamIds.map((teamId) => ({teamId, featureName}))
        : orgIds.map((orgId) => ({orgId, featureName}))

  if (values.length === 0) {
    throw new GraphQLError(
      'No valid subjects found to apply the feature flag. Check the scope of the feature flag.',
      {extensions: {code: 'NOT_FOUND'}}
    )
  }

  const [subjectIds, loadedSubjects] =
    scope === 'User'
      ? [userIds, await dataLoader.get('users').loadMany(userIds)]
      : scope === 'Team'
        ? [teamIds, await dataLoader.get('teams').loadMany(teamIds)]
        : [orgIds, await dataLoader.get('organizations').loadMany(orgIds)]
  const missingIds = subjectIds.filter((_id, idx) => !isValid(loadedSubjects[idx]))

  if (missingIds.length > 0) {
    throw new GraphQLError(`No ${scope} found with ID: ${missingIds.join(', ')}`, {
      extensions: {code: 'NOT_FOUND'}
    })
  }

  await pg
    .insertInto('FeatureFlagOwner')
    .values(values)
    .onConflict((oc) => oc.doNothing())
    .execute()

  return {
    featureName,
    userIds: scope === 'User' ? userIds : [],
    teamIds: scope === 'Team' ? teamIds : [],
    orgIds: scope === 'Organization' ? orgIds : []
  }
}

export default applyFeatureFlag
