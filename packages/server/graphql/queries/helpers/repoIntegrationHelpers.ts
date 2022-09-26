import ms from 'ms'
import {Unpromise} from 'parabol-client/types/generics'
import IntegrationRepoId, {
  JiraRepoIntegration,
  RepoIntegration
} from '../../../../client/shared/gqlIds/IntegrationRepoId'
import JiraProjectKeyId from '../../../../client/shared/gqlIds/JiraProjectKeyId'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import {DataLoaderWorker} from '../../graphql'

type JiraPrevRepoIntegrationRes = Omit<JiraRepoIntegration, 'projectKey'> & {
  issueKey: string
}

type PrevRepoIntegrationRes = (
  | Exclude<RepoIntegration, JiraRepoIntegration>
  | JiraPrevRepoIntegrationRes
) & {
  teamId: string
  userId: string
  lastUsedAt: Date
}

export const getPrevRepoIntegrations = async (
  userId: string,
  teamId: string,
  permLookup: Unpromise<ReturnType<typeof getPermsByTaskService>>
) => {
  const r = await getRethink()
  const prevIntegrationsRes = (await (
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
      lastUsedAt: row('reduction'),
      teamId
    }))
    .run()) as PrevRepoIntegrationRes[]

  const threeMonthsAgo = new Date(Date.now() - ms('90d'))
  const usedIntegrationIds = new Set<string>()
  return (
    prevIntegrationsRes
      // we don't store the projectKey needed by IntegrationRepoId or key needed by JiraRemoteProject
      .map((res) =>
        res.service === 'jira'
          ? {
              ...res,
              projectKey: JiraProjectKeyId.join(res.issueKey),
              key: JiraProjectKeyId.join(res.issueKey)
            }
          : res
      )
      // remove dups and integrations that haven't been used for three months
      .filter((res) => {
        const integrationId = IntegrationRepoId.join(res)
        if (usedIntegrationIds.has(integrationId)) return false
        usedIntegrationIds.add(integrationId)
        return permLookup[res.service] && res.lastUsedAt > threeMonthsAgo
      })
  )
}

export const getPermsByTaskService = async (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string
) => {
  // we need to see which team integrations the user has access to
  const [atlassianAuth, githubAuth, gitlabAuth, azureAuth, jiraServerAuth] = await Promise.all([
    dataLoader.get('freshAtlassianAuth').load({teamId, userId}),
    dataLoader.get('githubAuth').load({teamId, userId}),
    dataLoader.get('freshGitlabAuth').load({teamId, userId}),
    dataLoader.get('freshAzureDevOpsAuth').load({teamId, userId}),
    dataLoader.get('teamMemberIntegrationAuths').load({service: 'jiraServer', teamId, userId})
  ])

  return {
    jira: !!atlassianAuth,
    github: !!githubAuth,
    gitlab: !!gitlabAuth,
    azureDevOps: !!azureAuth,
    jiraServer: !!jiraServerAuth,
    PARABOL: true
  }
}
