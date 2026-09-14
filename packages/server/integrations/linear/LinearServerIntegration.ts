import LinearIssueId from 'parabol-client/shared/gqlIds/LinearIssueId'
import LinearProjectId from 'parabol-client/shared/gqlIds/LinearProjectId'
import {linearIntegrationMeta} from 'parabol-client/shared/integrations/linearIntegrationMeta'
import interleave from 'parabol-client/utils/interleave'
import {
  fetchLinearProjects,
  fetchLinearTeams
} from '../../graphql/queries/helpers/fetchLinearTeamsAndProjects'
import type {LinearRepo} from '../platform/RemoteRepoIntegration'
import {
  type EstimatePushCapability,
  type GqlIntegrationCtx,
  type IssueCreateCapability,
  type IssueReadCapability,
  type IssueRef,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import describeLinearDimensionField from './describeLinearDimensionField'
import isLinearTeam from './isLinearTeam'
import LinearServerManager from './LinearServerManager'
import listLinearDimensionFields from './listLinearDimensionFields'
import pushEstimateToLinear from './pushEstimateToLinear'
import resolveLinearDimensionFieldKey from './resolveLinearDimensionFieldKey'
import resolveLinearTaskIntegration from './resolveLinearTaskIntegration'

export class LinearServerIntegration extends ServerIntegrationDefinition {
  readonly service = linearIntegrationMeta.service
  readonly title = linearIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveIssue(ctx: GqlIntegrationCtx, id: string): Promise<IssueRef | null> {
    const {userId, context, info} = ctx
    if (id.includes('::')) {
      const {repoId, issueId} = LinearIssueId.split(id)
      if (!repoId || !issueId) return null
      return {
        integrationHash: LinearIssueId.join(repoId, issueId),
        integration: {accessUserId: userId, service: 'linear' as const, repoId, issueId}
      }
    }
    const auth = await this.resolveAuth(ctx)
    if (!auth) return null
    const [data, error] = await new LinearServerManager(auth, context, info).getIssue({id})
    const issue = data?.issue
    if (error || !issue) return null
    const repoId = LinearProjectId.join(issue.team.id, issue.project?.id)
    return {
      integrationHash: LinearIssueId.join(repoId, issue.id),
      integration: {accessUserId: userId, service: 'linear' as const, repoId, issueId: issue.id}
    }
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    repoList: RepoListCapability<LinearRepo>
    estimatePush: EstimatePushCapability
  } = {
    issueCreate: {
      initManager: async (ctx) => {
        const auth = await this.resolveAuth(ctx)
        return auth ? new LinearServerManager(auth, ctx.context, ctx.info) : null
      }
    },
    issueRead: {getIssue: resolveLinearTaskIntegration},
    repoList: {
      fetchRepos: async ({teamId, userId, context, info}) => {
        const [projects, teams] = await Promise.all([
          fetchLinearProjects(teamId, userId, context, info),
          fetchLinearTeams(teamId, userId, context, info)
        ])
        if (projects instanceof Error) return projects
        if (teams instanceof Error) return teams
        return interleave<LinearRepo>([projects, teams])
      },
      integrationRepoId: (repo) =>
        isLinearTeam(repo)
          ? LinearProjectId.join(repo.id)
          : LinearProjectId.join(repo.teams.nodes[0].id, repo.id),
      name: (repo) =>
        isLinearTeam(repo) ? repo.displayName : `${repo.teams.nodes[0].displayName}/${repo.name}`
    },
    estimatePush: {
      targets: ['comment', 'field'],
      pushEstimate: pushEstimateToLinear,
      resolveDimensionFieldKey: resolveLinearDimensionFieldKey,
      describeDimensionField: describeLinearDimensionField,
      listDimensionFields: listLinearDimensionFields
    }
  }
}
