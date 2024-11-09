import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {ProviderListQuery} from '../../../../__generated__/ProviderListQuery.graphql'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import {PALETTE} from '../../../../styles/paletteV3'
import AtlassianProviderRow from '../ProviderRow/AtlassianProviderRow'
import AzureDevOpsProviderRow from '../ProviderRow/AzureDevOpsProviderRow'
import GcalProviderRow from '../ProviderRow/GcalProviderRow'
import GitHubProviderRow from '../ProviderRow/GitHubProviderRow'
import GitLabProviderRow from '../ProviderRow/GitLabProviderRow'
import JiraServerProviderRow from '../ProviderRow/JiraServerProviderRow'
import MSTeamsProviderRow from '../ProviderRow/MSTeamsProviderRow'
import MattermostProviderRow from '../ProviderRow/MattermostProviderRow'
import SlackProviderRow from '../ProviderRow/SlackProviderRow'

interface Props {
  queryRef: PreloadedQuery<ProviderListQuery>
  teamId: string
  retry: () => void
}

const StyledWrapper = styled(SettingsWrapper)({
  display: 'block'
})

const Note = styled('div')({
  paddingTop: 29,
  paddingBottom: 25,
  fontSize: 13
})

const Heading = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  fontWeight: 600
})

const AvailableHeading = styled(Heading)({
  paddingTop: 16
})

const query = graphql`
  query ProviderListQuery($teamId: ID!) {
    viewer {
      ...AtlassianProviderRow_viewer
      ...JiraServerProviderRow_viewer
      ...GitHubProviderRow_viewer
      ...GitLabProviderRow_viewer
      ...MattermostProviderRow_viewer
      ...SlackProviderRow_viewer
      ...AzureDevOpsProviderRow_viewer
      ...MSTeamsProviderRow_viewer
      ...GcalProviderRow_viewer

      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            accessToken
          }
          jiraServer {
            auth {
              id
              isActive
            }
            sharedProviders {
              id
            }
          }
          gcal {
            auth {
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
          azureDevOps {
            auth {
              accessToken
            }
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
  const {queryRef, retry, teamId} = props
  const data = usePreloadedQuery<ProviderListQuery>(query, queryRef)
  const {viewer} = data
  const integrations = viewer.teamMember?.integrations

  const allIntegrations = [
    {
      name: 'Atlassian',
      connected: !!integrations?.atlassian?.accessToken,
      component: (
        <AtlassianProviderRow key='atlassian' teamId={teamId} retry={retry} viewer={viewer} />
      )
    },
    {
      name: 'Jira Server',
      connected:
        !!integrations?.jiraServer?.auth?.isActive && integrations.jiraServer?.sharedProviders[0],
      component: <JiraServerProviderRow key='jira' teamId={teamId} viewerRef={viewer} />
    },
    {
      name: 'GitHub',
      connected: !!integrations?.github?.accessToken,
      component: <GitHubProviderRow key='github' teamId={teamId} viewer={viewer} />
    },
    {
      name: 'GitLab',
      connected: !!integrations?.gitlab.auth,
      component: <GitLabProviderRow key='gitlab' teamId={teamId} viewerRef={viewer} />
    },
    {
      name: 'Mattermost',
      connected: !!integrations?.mattermost.auth,
      component: <MattermostProviderRow key='mm' teamId={teamId} viewerRef={viewer} />
    },
    {
      name: 'Slack',
      connected: integrations?.slack?.isActive,
      component: <SlackProviderRow key='slack' teamId={teamId} viewer={viewer} />
    },
    {
      name: 'Azure DevOps',
      connected: !!integrations?.azureDevOps.auth?.accessToken,
      component: <AzureDevOpsProviderRow key='azure' teamId={teamId} viewerRef={viewer} />
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
    <StyledWrapper>
      <Note>
        Each team member must add the integrations they want to use. Integrations are scoped to the
        team where you add them.
      </Note>

      {connectedIntegrations.length > 0 && <Heading>Connected</Heading>}

      {connectedIntegrations}

      {availableIntegrations.length > 0 && <AvailableHeading>Available</AvailableHeading>}

      {availableIntegrations}
    </StyledWrapper>
  )
}

export default ProviderList
