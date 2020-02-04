import ms from 'ms'
import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'
import makeSuggestedIntegrationId from '../../../../client/utils/makeSuggestedIntegrationId'

export interface IntegrationByUserId {
  id: string
  userId: string
  service: 'github' | 'jira'
  nameWithOwner: string | null
  projectKey: string | null
  projectName: string | null
  avatar: string | null
  cloudId: string | null
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
  const r = await getRethink()
  const res = await (r
    .table('Task')
    .getAll(teamId, {index: 'teamId'})
    .filter((row) =>
      row('integration')
        .ne(null)
        .default(false)
    )
    .group((row) => [
      row('userId').default(null),
      row('integration')('service'),
      row('integration')('nameWithOwner').default(null),
      row('integration')('projectKey').default(null),
      row('integration')('projectName').default(null),
      row('integration')('avatar').default(null),
      row('integration')('cloudId').default(null)
    ]) as any)
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
      lastUsedAt: row('reduction')
    }))
    .run()
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
  const r = await getRethink()
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
      .run()
  ])

  return {
    jira: !!atlassianAuths.find((auth) => auth.teamId === teamId),
    github: !!githubAuthForTeam
  }
}
