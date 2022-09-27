import ms from 'ms'
import {Unpromise} from 'parabol-client/types/generics'
import IntegrationRepoId from '../../../../client/shared/gqlIds/IntegrationRepoId'
import JiraProjectKeyId from '../../../../client/shared/gqlIds/JiraProjectKeyId'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import TaskIntegrationAzureDevOps from '../../../database/types/TaskIntegrationAzureDevOps'
import TaskIntegrationGitHub from '../../../database/types/TaskIntegrationGitHub'
import TaskIntegrationGitLab from '../../../database/types/TaskIntegrationGitLab'
import TaskIntegrationJira from '../../../database/types/TaskIntegrationJira'
import TaskIntegrationJiraServer from '../../../database/types/TaskIntegrationJiraServer'
import {DataLoaderWorker} from '../../graphql'

type TaskIntegration = (
  | TaskIntegrationGitLab
  | TaskIntegrationJira
  | TaskIntegrationAzureDevOps
  | TaskIntegrationGitHub
  | TaskIntegrationJiraServer
) & {
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
        row('integration')('nameWithOwner').default(null),
        row('integration')('instanceId').default(null),
        row('integration')('projectId').default(null),
        row('integration')('providerId').default(null),
        row('integration')('gid').default(null),
        row('integration')('fullPath').default(null),
        row('integration')('name').default(null),
        row('integration')('url').default(null),
        row('integration')('projectKey').default(null),
        row('integration')('repositoryId').default(null),
        row('integration')('key').default(null)
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
      instanceId: row('group')(5),
      projectId: row('group')(6),
      providerId: row('group')(7),
      gid: row('group')(8),
      fullPath: row('group')(9),
      name: row('group')(10),
      url: row('group')(11),
      projectKey: row('group')(12),
      repositoryId: row('group')(13),
      key: row('group')(14),
      lastUsedAt: row('reduction'),
      teamId
    }))
    .run()) as TaskIntegration[]

  const threeMonthsAgo = new Date(Date.now() - ms('90d'))
  const usedIntegrationIds = new Set<string>()
  return (
    prevIntegrationsRes
      .map((res) => {
        if (res.service === 'jira') {
          return {
            ...res,
            id: IntegrationRepoId.join({
              ...res,
              projectKey: JiraProjectKeyId.join(res.issueKey)
            }),
            key: JiraProjectKeyId.join(res.issueKey) // needed by JiraRemoteProject
          }
        }
        if (res.service === 'jiraServer') {
          return {
            id: res.repositoryId,
            ...res
          }
        }
        if (res.service === 'azureDevOps') {
          return {
            ...res,
            id: res.projectKey // TODO: fix projectId / key inconsistencies: https://github.com/ParabolInc/parabol/issues/7073
          }
        }
        return res
      })
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
