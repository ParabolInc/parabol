import {linearIntegrationMeta} from 'parabol-client/shared/integrations/linearIntegrationMeta'
import interleave from 'parabol-client/utils/interleave'
import {
  fetchLinearProjects,
  fetchLinearTeams
} from '../../graphql/queries/helpers/fetchLinearTeamsAndProjects'
import {
  type EstimatePushCapability,
  type IssueCreateCapability,
  type IssueReadCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import describeLinearDimensionField from './describeLinearDimensionField'
import LinearServerManager from './LinearServerManager'
import pushEstimateToLinear from './pushEstimateToLinear'
import resolveLinearDimensionFieldKey from './resolveLinearDimensionFieldKey'
import resolveLinearTaskIntegration from './resolveLinearTaskIntegration'

export class LinearServerIntegration extends ServerIntegrationDefinition {
  readonly service = linearIntegrationMeta.service
  readonly title = linearIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    repoList: RepoListCapability
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
        return interleave([projects, teams])
      }
    },
    estimatePush: {
      targets: ['comment', 'field'],
      pushEstimate: pushEstimateToLinear,
      resolveDimensionFieldKey: resolveLinearDimensionFieldKey,
      describeDimensionField: describeLinearDimensionField
    }
  }
}
