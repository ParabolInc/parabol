import ms from 'ms'
import {Unpromise} from 'parabol-client/types/generics'
import makeSuggestedIntegrationId from 'parabol-client/utils/makeSuggestedIntegrationId'
import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'

export interface IntegrationByTeamId {
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
  teamIntegrationsByTeamId: IntegrationByTeamId[],
  userId: string
) => {
  const userIntegrationsForTeam = teamIntegrationsByTeamId.filter(
    (integration) => integration.userId === userId
  )
  const aMonthAgo = new Date(Date.now() - ms('30d'))

  // the user has 3+ active integrations, use those
  if (
    userIntegrationsForTeam.length >= MAX_RECENT_INTEGRATIONS &&
    userIntegrationsForTeam[MAX_RECENT_INTEGRATIONS - 1]!.lastUsedAt >= aMonthAgo
  ) {
    return userIntegrationsForTeam
  }

  // at least 1 person has 1 integration on the team
  const integrationSet = new Set()
  teamIntegrationsByTeamId.forEach(({id}) => integrationSet.add(id))

  // the user is integrated against every team integration, use those
  return userIntegrationsForTeam.length === integrationSet.size
    ? userIntegrationsForTeam
    : undefined
}

export const getTeamIntegrationsByTeamId = async (
  teamId: string,
  permLookup: Unpromise<ReturnType<typeof getPermsByTaskService>>
): Promise<IntegrationByTeamId[]> => {
  const r = await getRethink()
  const res = await (
    r
      .table('Task')
      .getAll(teamId, {index: 'teamId'})
      .filter((row) => row('integration').ne(null).default(false))
      .group((row) => [
        row('userId').default(null),
        row('integration')('service'),
        row('integration')('nameWithOwner').default(null),
        row('integration')('projectKey').default(null),
        row('integration')('avatar').default(null),
        row('integration')('cloudId').default(null)
      ]) as any
  )
    .max('createdAt')('createdAt')
    .ungroup()
    .orderBy(r.desc('reduction'))
    .map((row) => ({
      userId: row('group')(0),
      service: row('group')(1),
      nameWithOwner: row('group')(2),
      projectKey: row('group')(3),
      avatar: row('group')(4),
      cloudId: row('group')(5),
      lastUsedAt: row('reduction')
    }))
    .run()
  return (
    res
      // jira integrations are making it through that don't have a projectKey
      .filter((res) => permLookup[res.service] && (res.service !== 'jira' || res.projectKey))
      .map((item) => ({
        ...item,
        id: makeSuggestedIntegrationId(item)
      }))
  )
}

export const getPermsByTaskService = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string
) => {
  // we need to see which team integrations the user has access to
  const [atlassianAuth, githubAuth] = await Promise.all([
    dataLoader.get('freshAtlassianAuth').load({teamId, userId}),
    dataLoader.get('githubAuth').load({teamId, userId})
  ])

  return {
    jira: !!atlassianAuth,
    github: !!githubAuth
  }
}
