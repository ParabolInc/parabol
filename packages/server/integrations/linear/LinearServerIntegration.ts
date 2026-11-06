import LinearProjectId from 'parabol-client/integrations/linear/shared/LinearProjectId'
import {linearIntegrationMeta} from 'parabol-client/integrations/linear/shared/linearIntegrationMeta'
import interleave from 'parabol-client/utils/interleave'
import type {LinearSearchQueryJson} from '../../postgres/types'
import {
  type EstimatePushCapability,
  type IssueCreateCapability,
  type IssueListCapability,
  type IssueReadCapability,
  type IssueSearchCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import buildLinearSearchQuery from './buildLinearSearchQuery'
import describeLinearDimensionField from './describeLinearDimensionField'
import {fetchLinearProjects, fetchLinearTeams, type LinearRepo} from './fetchLinearTeamsAndProjects'
import isLinearTeam from './isLinearTeam'
import LinearServerManager from './LinearServerManager'
import listLinearDimensionFields from './listLinearDimensionFields'
import listLinearIssues from './listLinearIssues'
import parseLinearIntegrationHash from './parseLinearIntegrationHash'
import pushEstimateToLinear from './pushEstimateToLinear'
import resolveLinearDimensionFieldKey from './resolveLinearDimensionFieldKey'
import resolveLinearTaskIntegration from './resolveLinearTaskIntegration'

export class LinearServerIntegration extends ServerIntegrationDefinition<LinearRepo> {
  readonly service = linearIntegrationMeta.service
  readonly title = linearIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    issueSearch: IssueSearchCapability<LinearSearchQueryJson>
    repoList: RepoListCapability<LinearRepo>
    estimatePush: EstimatePushCapability
    issueList: IssueListCapability
  } = {
    issueCreate: {
      initManager: async (ctx) => {
        const auth = await this.resolveAuth(ctx)
        return auth ? new LinearServerManager(auth, ctx.context, ctx.info) : null
      }
    },
    issueRead: {
      getIssue: resolveLinearTaskIntegration,
      parseIntegrationHash: parseLinearIntegrationHash
    },
    issueSearch: {buildQuery: buildLinearSearchQuery},
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
    },
    issueList: {listIssues: listLinearIssues}
  }
}
