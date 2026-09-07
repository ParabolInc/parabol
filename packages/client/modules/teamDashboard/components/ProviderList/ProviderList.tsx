import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ProviderListQuery} from '../../../../__generated__/ProviderListQuery.graphql'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import {
  getClientIntegration,
  isRegisteredClientIntegration
} from '../../../../integrations/platform/registry'
import {hasConfluenceScopes} from '../../../../utils/atlassianScopes'
import ConfluenceProviderRow from '../ProviderRow/ConfluenceProviderRow'
import GcalProviderRow from '../ProviderRow/GcalProviderRow'
import IntegrationServiceProviderRow from '../ProviderRow/IntegrationServiceProviderRow'
import MattermostProviderRow from '../ProviderRow/MattermostProviderRow'
import MSTeamsProviderRow from '../ProviderRow/MSTeamsProviderRow'
import SlackProviderRow from '../ProviderRow/SlackProviderRow'

interface Props {
  queryRef: PreloadedQuery<ProviderListQuery>
  teamId: string
}

const query = graphql`
  query ProviderListQuery($teamId: ID!) {
    viewer {
      ...ConfluenceProviderRow_viewer
      ...MattermostProviderRow_viewer
      ...SlackProviderRow_viewer
      ...MSTeamsProviderRow_viewer
      ...GcalProviderRow_viewer
      teamMember(teamId: $teamId) {
        services {
          id
          service
          title
          isAvailable
          isConnected
          ...IntegrationServiceProviderRow_service
        }
        integrations {
          atlassian {
            accessToken
            scope
          }
          gcal {
            auth {
              id
            }
          }
          mattermost {
            auth {
              provider {
                id
              }
            }
          }
          slack {
            isActive
          }
          msTeams {
            auth {
              provider {
                id
              }
            }
          }
        }
      }
    }
  }
`

const ProviderList = (props: Props) => {
  const {queryRef, teamId} = props
  const data = usePreloadedQuery<ProviderListQuery>(query, queryRef)
  const {viewer} = data
  const integrations = viewer.teamMember?.integrations
  const services = viewer.teamMember?.services ?? []

  const taskIntegrations = services
    .filter(
      ({service, isAvailable}) =>
        isRegisteredClientIntegration(service) &&
        (isAvailable || !!getClientIntegration(service).contactUs)
    )
    .map((integrationService) => ({
      name: integrationService.title,
      connected: integrationService.isConnected && integrationService.isAvailable,
      component: (
        <IntegrationServiceProviderRow
          key={integrationService.id}
          teamId={teamId}
          serviceRef={integrationService}
        />
      )
    }))

  const allIntegrations = [
    ...taskIntegrations,
    {
      name: 'Atlassian Confluence',
      connected:
        !!integrations?.atlassian?.accessToken &&
        hasConfluenceScopes(integrations?.atlassian?.scope),
      component: <ConfluenceProviderRow key='confluence' teamId={teamId} viewerRef={viewer} />
    },
    {
      name: 'Mattermost',
      connected: !!integrations?.mattermost.auth,
      component: <MattermostProviderRow key='mm' teamId={teamId} viewerRef={viewer} />
    },
    {
      name: 'Slack',
      connected: !!integrations?.slack?.isActive,
      component: <SlackProviderRow key='slack' teamId={teamId} viewer={viewer} />
    },
    {
      name: 'MS Teams',
      connected: !!integrations?.msTeams.auth,
      component: <MSTeamsProviderRow key='teams' teamId={teamId} viewerRef={viewer} />
    },
    {
      name: 'Gcal Integration',
      connected: !!integrations?.gcal?.auth,
      component: <GcalProviderRow key='gcal' viewerRef={viewer} teamId={teamId} />
    }
  ]

  const connectedIntegrations = allIntegrations
    .filter((integration) => integration.connected)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((integration) => integration.component)

  const availableIntegrations = allIntegrations
    .filter((integration) => !integration.connected)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((integration) => integration.component)

  return (
    <div className='block'>
      <SettingsWrapper>
        <div className='pt-7 pb-6 text-sm'>
          Each team member must add the integrations they want to use. Integrations are scoped to
          the team where you add them.
        </div>

        {connectedIntegrations.length > 0 && (
          <div className='font-semibold text-base text-fg-primary'>Connected</div>
        )}

        {connectedIntegrations}

        {availableIntegrations.length > 0 && (
          <div className='pt-4 font-semibold text-base text-fg-primary'>Available</div>
        )}

        {availableIntegrations}
      </SettingsWrapper>
    </div>
  )
}

export default ProviderList
