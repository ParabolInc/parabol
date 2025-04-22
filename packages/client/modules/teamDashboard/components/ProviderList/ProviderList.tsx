import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {ProviderListQuery} from '../../../../__generated__/ProviderListQuery.graphql'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import AtlassianProviderRow from '../ProviderRow/AtlassianProviderRow'
import AzureDevOpsProviderRow from '../ProviderRow/AzureDevOpsProviderRow'
import GcalProviderRow from '../ProviderRow/GcalProviderRow'
import GitHubProviderRow from '../ProviderRow/GitHubProviderRow'
import GitLabProviderRow from '../ProviderRow/GitLabProviderRow'
import JiraServerProviderRow from '../ProviderRow/JiraServerProviderRow'
import LinearProviderRow from '../ProviderRow/LinearProviderRow'
import MSTeamsProviderRow from '../ProviderRow/MSTeamsProviderRow'
import MattermostProviderRow from '../ProviderRow/MattermostProviderRow'
import SlackProviderRow from '../ProviderRow/SlackProviderRow'

interface Props {
  queryRef: PreloadedQuery<ProviderListQuery>
  teamId: string
  retry: () => void
}

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
      ...LinearProviderRow_viewer
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
          linear {
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
      name: 'Jira Data Center',
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
      name: 'Linear',
      connected: !!integrations?.linear?.auth,
      component: <LinearProviderRow key='linear' teamId={teamId} viewerRef={viewer} />
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
    <div className='block'>
      <SettingsWrapper>
        <div className='pt-7 pb-6 text-sm'>
          Each team member must add the integrations they want to use. Integrations are scoped to
          the team where you add them.
        </div>

        {connectedIntegrations.length > 0 && (
          <div className='text-base font-semibold text-slate-700'>Connected</div>
        )}

        {connectedIntegrations}

        {availableIntegrations.length > 0 && (
          <div className='pt-4 text-base font-semibold text-slate-700'>Available</div>
        )}

        {availableIntegrations}
      </SettingsWrapper>
    </div>
  )
}

export default ProviderList
