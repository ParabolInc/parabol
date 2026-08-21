import {Providers} from '../../types/constEnums'
import LinearIssueId from '../gqlIds/LinearIssueId'
import type {IntegrationMeta} from './IntegrationMeta'

export const linearIntegrationMeta = {
  service: 'linear',
  title: Providers.LINEAR_NAME,
  description: Providers.LINEAR_DESC,
  ids: {
    joinIssue: (parts) => LinearIssueId.join(String(parts.repoId), String(parts.issueId)),
    splitIssue: (id) => LinearIssueId.split(id)
  }
} satisfies IntegrationMeta
