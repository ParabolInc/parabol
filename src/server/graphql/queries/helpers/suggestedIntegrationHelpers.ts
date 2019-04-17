import getRethink from 'server/database/rethinkDriver'
import {DataLoaderWorker} from 'server/graphql/graphql'

export interface IntegrationByUserId {
  userId: string
  service: 'github' | 'jira'
  nameWithOwner: string | null
  projectId: string | null
  projectKey: string | null
  projectName: string | null
  avatar: string | null
  cloudId: string | null
  lastUsedAt: Date
}

export const useOnlyUserIntegrations = (
  teamIntegrationsByUserId: IntegrationByUserId[],
  userId: string
) => {
  const userIntegrationsForTeam = teamIntegrationsByUserId.filter(
    (integration) => integration.userId === userId
  )
  const aMonthAgo = new Date(Date.now() - ms('30d'))

  // the user has 3+ active integrations, use those
  if (userIntegrationsForTeam.length >= 3 && userIntegrationsForTeam[2].lastUsedAt >= aMonthAgo) {
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

export const getTeamIntegrationsByUserId = (teamId: string): Promise<IntegrationByUserId[]> => {
  const r = getRethink()
  return r
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
        .row('integration')('projectId')
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
        .default(null)
    ])
    .max('createdAt')('createdAt')
    .ungroup()
    .orderBy(r.desc('reduction'))
    .map((row) => ({
      userId: row('group')(0),
      service: row('group')(1),
      nameWithOwner: row('group')(2),
      projectId: row('group')(3),
      projectKey: row('group')(4),
      projectName: row('group')(5),
      avatar: row('group')(6),
      cloudId: row('group')(7),
      lastUsedAt: row('reduction')
    }))
    .merge((row) => ({
      id: r.or(
        // create a unique ID across all provider interfaces
        row('projectId').default(false),
        row('nameWithOwner').default(false)
      )
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

  return {
    jira: !!atlassianAuths.find((auth) => auth.teamId === teamId),
    github: !!githubAuthForTeam
  }
}
