import ms from 'ms'
import {Unpromise} from 'parabol-client/types/generics'
import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'
import IntegrationRepoId, {
  GitHubItem,
  JiraItem
} from 'parabol-client/shared/gqlIds/IntegrationRepoId'

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

type RepoIntegrationItemRes = (JiraItem | GitHubItem) & {
  lastUsedAt: Date
}

export const getUserIntegrationIds = async (
  userId: string,
  teamId: string,
  permLookup: Unpromise<ReturnType<typeof getPermsByTaskService>>
) => {
  const r = await getRethink()
  const res = (await (
    r
      .table('Task')
      .getAll(teamId, {index: 'teamId'})
      .filter((row) => row('integration').ne(null).default(false).and(row('userId').eq(userId)))
      .group((row) => [
        row('userId').default(null),
        row('integration')('service'),
        row('integration')('projectKey').default(null),
        row('integration')('cloudId').default(null),
        row('integration')('nameWithOwner').default(null)
      ]) as any
  )
    .max('createdAt')('createdAt')
    .ungroup()
    .orderBy(r.desc('reduction'))
    .map((row) => ({
      userId: row('group')(0),
      service: row('group')(1),
      projectKey: row('group')(2),
      cloudId: row('group')(3),
      nameWithOwner: row('group')(4),
      lastUsedAt: row('reduction')
    }))
    .run()) as RepoIntegrationItemRes[]

  const threeMonthsAgo = new Date(Date.now() - ms('90d'))
  return res
    .filter(
      (res) =>
        permLookup[res.service] &&
        (res.service !== 'jira' || res.projectKey) && // jira integrations are making it through that don't have a projectKey
        res.lastUsedAt > threeMonthsAgo
    )
    .map((item) => IntegrationRepoId.join(item))
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
