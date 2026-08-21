import {Providers} from '../../types/constEnums'
import GitLabIssueId from '../gqlIds/GitLabIssueId'
import type {IntegrationMeta} from './IntegrationMeta'

export const gitlabIntegrationMeta = {
  service: 'gitlab',
  title: Providers.GITLAB_NAME,
  description: 'Use GitLab Issues from within Parabol.',
  ids: {
    joinIssue: (parts) => GitLabIssueId.join(String(parts.providerId), String(parts.gid)),
    splitIssue: (id) => GitLabIssueId.split(id)
  }
} satisfies IntegrationMeta
