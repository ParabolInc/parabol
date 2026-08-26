import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {
  IntegrationProviderServiceEnum,
  useIsIntegrated_teamMember$key
} from '../__generated__/useIsIntegrated_teamMember.graphql'

type IntegrationLookup = {
  hasGitHub: boolean
  hasAtlassian: boolean
  hasGitLab: boolean
  hasJiraServer: boolean
  hasAzureDevOps: boolean
  hasLinear: boolean
}

export const makePlaceholder = (integrationLookup: IntegrationLookup) => {
  const {hasGitHub, hasAtlassian, hasGitLab, hasAzureDevOps, hasLinear} = integrationLookup
  const names = [] as string[]
  if (hasGitHub) names.push('GitHub')
  if (hasAtlassian) names.push('Jira')
  if (hasGitLab) names.push('GitLab')
  if (hasAzureDevOps) names.push('Azure DevOps')
  if (hasLinear) names.push('Linear')
  return `Search ${names.join(' & ')}`
}

export const useIsIntegrated = (teamMemberRef?: useIsIntegrated_teamMember$key | null) => {
  const teamMember = useFragment(
    graphql`
      fragment useIsIntegrated_teamMember on TeamMember {
        services {
          service
          isConnected
        }
      }
    `,
    teamMemberRef ?? null
  )
  if (!teamMember) {
    return null
  }
  const isConnected = (service: IntegrationProviderServiceEnum) =>
    teamMember.services.some((entry) => entry.service === service && entry.isConnected)
  const lookup: IntegrationLookup = {
    hasAtlassian: isConnected('jira'),
    hasGitHub: isConnected('github'),
    hasJiraServer: isConnected('jiraServer'),
    hasGitLab: isConnected('gitlab'),
    hasAzureDevOps: isConnected('azureDevOps'),
    hasLinear: isConnected('linear')
  }
  return Object.values(lookup).some(Boolean) ? lookup : null
}
