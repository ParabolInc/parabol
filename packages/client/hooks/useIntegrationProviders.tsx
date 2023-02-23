import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {IntegrationProviders} from '../types/constEnums'
import {useIntegrationProvidersGetProvidersListQuery} from '../__generated__/useIntegrationProvidersGetProvidersListQuery.graphql'
import useAtmosphere from './useAtmosphere'

const query = graphql`
  query useIntegrationProvidersGetProvidersListQuery($teamId: ID!) {
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

export type Integration = {
  name: string
  connected: boolean
  regex: RegExp
  provider?: any
}

const useIntegrationProviders = (teamId: string): Integration[] => {
  const [providers, setProviders] = useState<Integration[]>([])
  const atmosphere = useAtmosphere()

  useEffect(() => {
    const getProviders = async () => {
      const result = await atmosphere.fetchQuery<useIntegrationProvidersGetProvidersListQuery>(
        query,
        {
          teamId
        }
      )

      const integrations = result?.viewer?.teamMember?.integrations

      const allIntegrations: Integration[] = [
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
          provider: integrations?.jiraServer?.sharedProviders[0]
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
          provider: integrations?.gitlab?.cloudProvider
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
          provider:
            integrations?.azureDevOps?.sharedProviders[0] ??
            integrations?.azureDevOps?.cloudProvider
        }
      ]

      setProviders(allIntegrations)
    }

    getProviders()
  }, [teamId])

  return providers
}

export default useIntegrationProviders
