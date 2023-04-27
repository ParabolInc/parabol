import graphql from 'babel-plugin-relay/macro'
import {Close} from '@mui/icons-material'
import React from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps, {MenuMutationProps} from '../../hooks/useMutationProps'
import {IntegrationBannerQuery} from '../../__generated__/IntegrationBannerQuery.graphql'
import {IntegrationProviders, LocalStorageKey} from '../../types/constEnums'
import AtlassianClientManager from '../../utils/AtlassianClientManager'
import AzureDevOpsClientManager from '../../utils/AzureDevOpsClientManager'
import GitHubClientManager from '../../utils/GitHubClientManager'
import GitLabClientManager from '../../utils/GitLabClientManager'
import JiraServerClientManager from '../../utils/JiraServerClientManager'
import SlackClientManager from '../../utils/SlackClientManager'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useIntegrationBanner from '../../hooks/useIntegrationBanner'
import {EditorState} from 'draft-js'

type IntegrationBannerProps = {
  teamId: string
  queryRef: PreloadedQuery<IntegrationBannerQuery>
  editorState: EditorState
}

const query = graphql`
  query IntegrationBannerQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            accessToken
          }
          jiraServer {
            auth {
              isActive
            }
            sharedProviders {
              id
            }
          }
          github {
            accessToken
          }
          gitlab {
            auth {
              provider {
                scope
              }
            }
            cloudProvider {
              id
              clientId
              serverBaseUrl
            }
          }
          slack {
            isActive
          }
          azureDevOps {
            auth {
              accessToken
            }

            sharedProviders {
              id
              tenantId
              clientId
            }

            cloudProvider {
              id
              tenantId
              clientId
            }
          }
        }
      }
    }
  }
`

type GitLabProvider = {
  clientId: string
  id: string
  serverBaseUrl: string
}

type AzureCloudProvider = {id: string; tenantId: string | null; clientId: string}

type JiraProvider = {
  id: string
}

export type Integration = {
  name: string
  connected: boolean
  regex: RegExp
  provider?: GitLabProvider | AzureCloudProvider | JiraProvider
}

const IntegrationBanner: React.FC<IntegrationBannerProps> = ({teamId, queryRef, editorState}) => {
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const atmosphere = useAtmosphere()
  const [showBanner, setShowBanner] = React.useState<boolean>(false)
  const data = usePreloadedQuery<IntegrationBannerQuery>(query, queryRef)

  const {viewer} = data

  const {teamMember} = viewer
  const {integrations} = teamMember!

  const integrationProviders: Integration[] = [
    {
      name: IntegrationProviders.ATLASSIAN,
      connected: Boolean(integrations?.atlassian?.accessToken),
      regex: /atlassian.net/
    },
    {
      name: IntegrationProviders.JIRA_SERVER,
      connected: Boolean(
        integrations?.jiraServer?.auth?.isActive && integrations.jiraServer?.sharedProviders[0]
      ),
      regex: /jira.com/,
      provider: integrations?.jiraServer?.sharedProviders[0] as JiraProvider
    },
    {
      name: IntegrationProviders.GITHUB,
      connected: Boolean(integrations?.github?.accessToken),
      regex: /github.com/
    },
    {
      name: IntegrationProviders.GITLAB,
      connected: Boolean(integrations?.gitlab.auth),
      regex: /gitlab.com/,
      provider: integrations?.gitlab?.cloudProvider as GitLabProvider
    },
    {
      name: IntegrationProviders.SLACK,
      connected: Boolean(integrations?.slack?.isActive),
      regex: /slack.com/
    },
    {
      name: IntegrationProviders.AZURE_DEVOPS,
      connected: Boolean(integrations?.azureDevOps.auth?.accessToken),
      regex: /azure.com/,
      provider: (integrations?.azureDevOps?.sharedProviders[0] ??
        integrations?.azureDevOps?.cloudProvider) as AzureCloudProvider
    }
  ]

  const activeIntegration = useIntegrationBanner(editorState, integrationProviders)
  const dismissedIntergrations: string | null = localStorage.getItem(
    LocalStorageKey.DISMISSED_INTERGRATIONS
  )

  function shouldShowBanner(
    dismissedIntegrations: string | null,
    integrations?: Integration | null
  ): boolean {
    if (!dismissedIntegrations) {
      return !activeIntegration?.connected
    }

    const dismissedIntegrationsList = JSON.parse(dismissedIntegrations)

    const isDismissed = dismissedIntegrationsList.integrations.some(
      (dismissedIntegration: Integration) => {
        return dismissedIntegration.name === integrations?.name
      }
    )

    if (isDismissed) {
      return false
    }

    return true
  }

  React.useEffect(() => {
    setShowBanner(shouldShowBanner(dismissedIntergrations, activeIntegration))
  }, [activeIntegration])

  const openOAuth = async () => {
    const integration = activeIntegration!
    switch (integration.name) {
      case IntegrationProviders.GITHUB:
        GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
        break
      case IntegrationProviders.ATLASSIAN:
        AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
        break
      case IntegrationProviders.JIRA_SERVER:
        const jiraProvider = integration.provider as JiraProvider
        JiraServerClientManager.openOAuth(atmosphere, jiraProvider.id, teamId, mutationProps)
        break
      case IntegrationProviders.GITLAB:
        const {
          clientId,
          id: cloudProviderId,
          serverBaseUrl
        } = integration.provider as GitLabProvider
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
        const azureProvider = integration.provider as AzureCloudProvider
        await AzureDevOpsClientManager.openOAuth(atmosphere, teamId, azureProvider, mutationProps)
        break
      default:
        break
    }
  }

  const handleOnDismiss = () => {
    const defaultValue = {integrations: []}
    const dismissedIntergrationsString = dismissedIntergrations ?? JSON.stringify(defaultValue)
    const savedIntegrations = JSON.parse(dismissedIntergrationsString)

    savedIntegrations.integrations.push(activeIntegration)

    localStorage.setItem(LocalStorageKey.DISMISSED_INTERGRATIONS, JSON.stringify(savedIntegrations))

    setShowBanner(false)
  }

  return (
    <>
      {showBanner && activeIntegration ? (
        <div className='mt-2 flex flex-row rounded-md border border-slate-400 p-2'>
          <div className='p-0'>
            <span
              onClick={openOAuth}
              className='mr-2 cursor-pointer font-semibold text-slate-800 underline hover:text-slate-600'
            >
              Connect Parabol to {activeIntegration.name}
            </span>
            for a more streamlined experience.
          </div>
          <Close className='ml-auto cursor-pointer text-slate-600' onClick={handleOnDismiss} />
        </div>
      ) : null}
    </>
  )
}

export default IntegrationBanner
