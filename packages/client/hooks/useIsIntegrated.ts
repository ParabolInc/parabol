import graphql from 'babel-plugin-relay/macro'

import {useFragment} from 'react-relay'
import {useIsIntegrated_integrations$key} from '../__generated__/useIsIntegrated_integrations.graphql'

type IntegrationLookup = {
  hasGitHub: boolean
  hasAtlassian: boolean
  hasGitLab: boolean
  hasJiraServer: boolean
  hasAzureDevOps: boolean
}

graphql`
  fragment useIsIntegratedJiraServerIntegration on JiraServerIntegration {
    auth {
      isActive
    }
  }
`
graphql`
  fragment useIsIntegratedAtlassianIntegration on AtlassianIntegration {
    isActive
  }
`
graphql`
  fragment useIsIntegratedGitHubIntegration on GitHubIntegration {
    isActive
  }
`
graphql`
  fragment useIsIntegratedGitLabIntegration on GitLabIntegration {
    auth {
      isActive
    }
  }
`
graphql`
  fragment useIsIntegratedAzureDevOpsIntegration on AzureDevOpsIntegration {
    auth {
      isActive
    }
  }
`

export const makePlaceholder = (integrationLookup: IntegrationLookup) => {
  const {hasGitHub, hasAtlassian, hasGitLab, hasAzureDevOps} = integrationLookup
  const names = [] as string[]
  if (hasGitHub) names.push('GitHub')
  if (hasAtlassian) names.push('Jira')
  if (hasGitLab) names.push('GitLab')
  if (hasAzureDevOps) names.push('Azure DevOps')
  return `Search ${names.join(' & ')}`
}

export const useIsIntegrated = (integrationsRef?: useIsIntegrated_integrations$key) => {
  const integrations = useFragment(
    graphql`
      fragment useIsIntegrated_integrations on TeamMemberIntegrations {
        jiraServer {
          ...useIsIntegratedJiraServerIntegration @relay(mask: false)
        }
        atlassian {
          ...useIsIntegratedAtlassianIntegration @relay(mask: false)
        }
        github {
          ...useIsIntegratedGitHubIntegration @relay(mask: false)
        }
        gitlab {
          ...useIsIntegratedGitLabIntegration @relay(mask: false)
        }
        azureDevOps {
          ...useIsIntegratedAzureDevOpsIntegration @relay(mask: false)
        }
      }
    `,
    integrationsRef ?? null
  )
  if (!integrations) {
    return null
  }
  const {atlassian, github, jiraServer, gitlab, azureDevOps} = integrations
  const hasAtlassian = atlassian?.isActive ?? false
  const hasGitHub = github?.isActive ?? false
  const hasGitLab = gitlab?.auth?.isActive ?? false
  const hasJiraServer = jiraServer?.auth?.isActive ?? false
  const hasAzureDevOps = azureDevOps?.auth?.isActive ?? false
  return hasAtlassian || hasGitHub || hasJiraServer || hasGitLab || hasAzureDevOps
    ? {
        hasAtlassian,
        hasGitHub,
        hasJiraServer,
        hasGitLab,
        hasAzureDevOps
      }
    : null
}
