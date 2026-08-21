import {Providers} from '../../types/constEnums'
import GitHubIssueId from '../gqlIds/GitHubIssueId'
import type {IntegrationMeta} from './IntegrationMeta'

export const githubIntegrationMeta = {
  service: 'github',
  title: Providers.GITHUB_NAME,
  description: Providers.GITHUB_DESC,
  ids: {
    joinIssue: (parts) =>
      GitHubIssueId.join(String(parts.nameWithOwner), Number(parts.issueNumber)),
    splitIssue: (id) => GitHubIssueId.split(id)
  }
} satisfies IntegrationMeta
