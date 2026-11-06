import getKysely from '../../../postgres/getKysely'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {getUserId} from '../../../utils/authorization'
import {getFeatureFlag} from '../../../utils/featureFlags'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const applyFeatureFlag: MutationResolvers['applyFeatureFlag'] = async (
  _source,
  {flagName, subjects},
  {authToken, dataLoader}
) => {
  const pg = getKysely()

  const viewerId = getUserId(authToken)

  const subjectKeys = Object.keys(subjects)

  if (subjectKeys.length === 0) {
    return standardError(new Error('At least one subject type must be provided'), {
      userId: viewerId
    })
  }

  const featureFlag = getFeatureFlag(flagName)

  if (!featureFlag) {
    return standardError(new Error('Feature flag not found'), {
      userId: viewerId
    })
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
      const users = await dataLoader.get('users').loadMany(subjects.userIds)
      const missingUserIds = subjects.userIds.filter((_userId, idx) => !users[idx])
      if (missingUserIds.length > 0) {
        return standardError(new Error(`Users not found: ${missingUserIds.join(', ')}`), {
          userId: viewerId
        })
      }
      userIds.push(...subjects.userIds)
    }
  } else if (scope === 'Team') {
    if (subjects.teamIds) {
      const teams = await dataLoader.get('teams').loadMany(subjects.teamIds)
      const missingTeamIds = subjects.teamIds.filter((_teamId, idx) => !teams[idx])
      if (missingTeamIds.length > 0) {
        return standardError(new Error(`Teams not found: ${missingTeamIds.join(', ')}`), {
          userId: viewerId
        })
      }
      teamIds.push(...subjects.teamIds)
    }
  } else if (scope === 'Organization') {
    if (subjects.orgIds) {
      const orgs = await dataLoader.get('organizations').loadMany(subjects.orgIds)
      const missingOrgIds = subjects.orgIds.filter((_orgId, idx) => !orgs[idx])
      if (missingOrgIds.length > 0) {
        return standardError(new Error(`Organizations not found: ${missingOrgIds.join(', ')}`), {
          userId: viewerId
        })
      }
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
    return standardError(
      new Error(
        'No valid subjects found to apply the feature flag. Check the scope of the feature flag.'
      )
    )
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
