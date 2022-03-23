import ms from 'ms'
import {Unpromise} from 'parabol-client/types/generics'
import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'
import JiraProjectKeyId from 'parabol-client/shared/gqlIds/JiraProjectKeyId'
import {RValue} from '../../../database/stricterR'

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

type PrevJiraRepoIntegration = {
  service: 'jira'
  userId: string
  issueKey: string
  cloudId: string
  nameWithOwner: null
  lastUsedAt: Date
}

type PrevGitHubRepoIntegration = {
  service: 'github'
  userId: string
  projectKey: null
  cloudId: null
  nameWithOwner: string
  lastUsedAt: Date
}

type PrevRepoIntegrationRes = PrevGitHubRepoIntegration | PrevJiraRepoIntegration

export const getPrevRepoIntegrations = async (
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
        row('integration')('issueKey').default(null),
        row('integration')('cloudId').default(null),
        row('integration')('nameWithOwner').default(null)
      ]) as any
  )
    .max('createdAt')('createdAt')
    .ungroup()
    .orderBy(r.desc('reduction'))
    .map((row: RValue) => ({
      userId: row('group')(0),
      service: row('group')(1),
      issueKey: row('group')(2),
      cloudId: row('group')(3),
      nameWithOwner: row('group')(4),
      lastUsedAt: row('reduction')
    }))
    .run()) as PrevRepoIntegrationRes[]

  const threeMonthsAgo = new Date(Date.now() - ms('90d'))
  return res
    .filter((res) => permLookup[res.service] && res.lastUsedAt > threeMonthsAgo)
    .map((res) =>
      res.service === 'jira' ? {...res, projectKey: JiraProjectKeyId.join(res.issueKey)} : res
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
