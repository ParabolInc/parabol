import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import React from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import {Integration} from '../../hooks/useIntegrationProviders'
import useMutationProps, {MenuMutationProps} from '../../hooks/useMutationProps'
import {PALETTE} from '../../styles/paletteV3'
import {IntegrationProviders} from '../../types/constEnums'
import AtlassianClientManager from '../../utils/AtlassianClientManager'
import AzureDevOpsClientManager from '../../utils/AzureDevOpsClientManager'
import GitHubClientManager from '../../utils/GitHubClientManager'
import GitLabClientManager from '../../utils/GitLabClientManager'
import JiraServerClientManager from '../../utils/JiraServerClientManager'
import SlackClientManager from '../../utils/SlackClientManager'

const SuggestIntegration = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '4px',
  marginTop: '8px',
  padding: '8px 6px'
})

const Link = styled('span')({
  color: PALETTE.SLATE_800,
  cursor: 'pointer',
  textDecoration: 'underline',
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_600
  }
})

const SuggestionContent = styled('div')({
  padding: 0
})

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer'
})

type IntegrationBannerProps = {
  integration: Integration
  onDismiss?: () => void
  teamId: string
}

const IntegrationBanner: React.FC<IntegrationBannerProps> = ({integration, onDismiss, teamId}) => {
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const atmosphere = useAtmosphere()

  const openOAuth = async () => {
    switch (integration.name) {
      case IntegrationProviders.GITHUB:
        GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
        break
      case IntegrationProviders.ATLASSIAN:
        AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
        break
      case IntegrationProviders.JIRA_SERVER:
        JiraServerClientManager.openOAuth(atmosphere, integration.provider, teamId, mutationProps)
        break
      case IntegrationProviders.GITLAB:
        const {clientId, id: cloudProviderId, serverBaseUrl} = integration.provider
        GitLabClientManager.openOAuth(
          atmosphere,
          cloudProviderId,
          clientId,
          serverBaseUrl,
          teamId,
          mutationProps
        )
        break
      case IntegrationProviders.SLACK:
        SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
        break
      case IntegrationProviders.AZURE_DEVOPS:
        const provider =
          integration.provider.azureDevOps?.sharedProviders[0] ??
          integration.provider.azureDevOps?.cloudProvider
        await AzureDevOpsClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
        break
      default:
        break
    }
  }

  return (
    <SuggestIntegration>
      <SuggestionContent>
        <Link onClick={openOAuth}>Connect Parabol to {integration.name} </Link> for a more
        streamlined experience.
      </SuggestionContent>
      <CloseIcon onClick={onDismiss} />
    </SuggestIntegration>
  )
}

export default IntegrationBanner
