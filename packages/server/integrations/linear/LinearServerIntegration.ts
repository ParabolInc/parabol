import LinearIssueId from 'parabol-client/shared/gqlIds/LinearIssueId'
import LinearProjectId from 'parabol-client/shared/gqlIds/LinearProjectId'
import {linearIntegrationMeta} from 'parabol-client/shared/integrations/linearIntegrationMeta'
import interleave from 'parabol-client/utils/interleave'
import {
  fetchLinearProjects,
  fetchLinearTeams
} from '../../graphql/queries/helpers/fetchLinearTeamsAndProjects'
import type {LinearSearchQueryJson} from '../../postgres/types'
import type {LinearRepo} from '../platform/RemoteRepoIntegration'
import {
  type EstimatePushCapability,
  type IssueCreateCapability,
  type IssueReadCapability,
  type IssueSearchCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import buildLinearSearchQuery from './buildLinearSearchQuery'
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

  parseIntegrationHash(integrationHash: string) {
    const {repoId, issueId} = LinearIssueId.split(integrationHash)
    if (!repoId || !issueId || LinearIssueId.join(repoId, issueId) !== integrationHash) return null
    return {service: 'linear' as const, repoId, issueId}
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    issueSearch: IssueSearchCapability<LinearSearchQueryJson>
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
    }
  }
}
