import ms from 'ms'
import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'
import makeSuggestedIntegrationId from '../../../../client/utils/makeSuggestedIntegrationId'

export interface IntegrationByUserId {
  id: string
  userId: string
  service: 'github' | 'jira' | 'azuredevops'
  nameWithOwner: string | null
  projectKey: string | null
  projectName: string | null
  avatar: string | null
  cloudId: string | null
  organization: string | null
  lastUsedAt: Date
}

const MAX_RECENT_INTEGRATIONS = 3
export const useOnlyUserIntegrations = (
  teamIntegrationsByUserId: IntegrationByUserId[],
  userId: string
) => {
  const userIntegrationsForTeam = teamIntegrationsByUserId.filter(
    (integration) => integration.userId === userId
  )
  const aMonthAgo = new Date(Date.now() - ms('30d'))

  // the user has 3+ active integrations, use those
  if (
    userIntegrationsForTeam.length >= MAX_RECENT_INTEGRATIONS &&
    userIntegrationsForTeam[MAX_RECENT_INTEGRATIONS - 1].lastUsedAt >= aMonthAgo
  ) {
    return userIntegrationsForTeam
  }

  // at least 1 person has 1 integration on the team
  const integrationSet = new Set()
  teamIntegrationsByUserId.forEach(({id}) => integrationSet.add(id))

  // the user is integrated against every team integration, use those
  return userIntegrationsForTeam.length === integrationSet.size
    ? userIntegrationsForTeam
    : undefined
}

export const getTeamIntegrationsByUserId = async (
  teamId: string
): Promise<IntegrationByUserId[]> => {
  const r = getRethink()
  const res = await r
    .table('Task')
    .getAll(teamId, {index: 'teamId'})
    .filter((row) =>
      row('integration')
        .ne(null)
        .default(false)
    )
    .group([
      r.row('userId').default(null),
      r.row('integration')('service'),
      r
        .row('integration')('nameWithOwner')
        .default(null),
      r
        .row('integration')('projectKey')
        .default(null),
      r
        .row('integration')('projectName')
        .default(null),
      r
        .row('integration')('avatar')
        .default(null),
      r
        .row('integration')('cloudId')
        .default(null),
      r
        .row('integration')('organization')
        .default(null)
    ])
    .max('createdAt')('createdAt')
    .ungroup()
    .orderBy(r.desc('reduction'))
    .map((row) => ({
      userId: row('group')(0),
      service: row('group')(1),
      nameWithOwner: row('group')(2),
      projectKey: row('group')(3),
      projectName: row('group')(4),
      avatar: row('group')(5),
      cloudId: row('group')(6),
      organization: row('group')(6),
      lastUsedAt: row('reduction')
    }))
  return res.map((item) => ({
    ...item,
    id: makeSuggestedIntegrationId(item)
  }))
}

export const getPermsByTaskService = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string
) => {
  const r = getRethink()
  // we need to see which team integrations the user has access to
  const [atlassianAuths, githubAuthForTeam] = await Promise.all([
    dataLoader.get('atlassianAuthByUserId').load(userId),
    r
      .table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        userId,
        service: 'GitHubIntegration',
        isActive: true
      })
      .nth(0)
      .default(null)
  ])

  //TODO: not ideal. Need to understand rethink schema.
  const [azureDevopsAuths] = await Promise.all([
    dataLoader.get('azureDevopsAuthByUserId').load(userId),
    r
      .table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        userId,
        service: 'GitHubIntegration',
        isActive: true
      })
      .nth(0)
      .default(null)
  ])

  return {
    jira: !!atlassianAuths.find((auth) => auth.teamId === teamId),
    azuredevops: !!azureDevopsAuths.find((auth) => auth.teamId === teamId),
    github: !!githubAuthForTeam
  }
}
