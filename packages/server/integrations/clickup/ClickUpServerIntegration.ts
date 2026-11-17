import ms from 'ms'
import {clickupIntegrationMeta} from 'parabol-client/integrations/clickup/shared/clickupIntegrationMeta'
import type {IntegrationSearchQueryJsonByService} from '../../postgres/types'
import {
  type EstimatePushCapability,
  type IssueCreateCapability,
  type IssueListCapability,
  type IssueReadCapability,
  type IssueSearchCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import buildClickUpSearchQuery from './buildClickUpSearchQuery'
import ClickUpServerManager from './ClickUpServerManager'
import describeClickUpDimensionField from './describeClickUpDimensionField'
import fetchClickUpRepos, {type ClickUpRepo} from './fetchClickUpRepos'
import listClickUpDimensionFields from './listClickUpDimensionFields'
import listClickUpIssues from './listClickUpIssues'
import parseClickUpIntegrationHash from './parseClickUpIntegrationHash'
import pushEstimateToClickUp from './pushEstimateToClickUp'
import resolveClickUpDimensionFieldKey from './resolveClickUpDimensionFieldKey'
import resolveClickUpTaskIntegration from './resolveClickUpTaskIntegration'

export class ClickUpServerIntegration extends ServerIntegrationDefinition {
  readonly service = clickupIntegrationMeta.service
  readonly title = clickupIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    issueSearch: IssueSearchCapability<IntegrationSearchQueryJsonByService['clickup']>
    issueList: IssueListCapability
    repoList: RepoListCapability<ClickUpRepo>
    estimatePush: EstimatePushCapability
  } = {
    issueCreate: {
      initManager: async (ctx) => {
        const auth = await this.resolveAuth(ctx)
        return auth ? new ClickUpServerManager(auth) : null
      }
    },
    issueRead: {
      getIssue: resolveClickUpTaskIntegration,
      parseIntegrationHash: parseClickUpIntegrationHash
    },
    issueSearch: {buildQuery: buildClickUpSearchQuery},
    issueList: {listIssues: listClickUpIssues},
    repoList: {
      fetchRepos: fetchClickUpRepos,
      integrationRepoId: (repo) => repo.id,
      name: (repo) => repo.name,
      refreshAfterMs: ms('10m')
    },
    estimatePush: {
      targets: ['comment', 'field'],
      pushEstimate: pushEstimateToClickUp,
      resolveDimensionFieldKey: resolveClickUpDimensionFieldKey,
      describeDimensionField: describeClickUpDimensionField,
      listDimensionFields: listClickUpDimensionFields
    }
  }
}
