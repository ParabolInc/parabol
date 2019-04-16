import {ProviderList_viewer} from '__generated__/ProviderList_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Panel from 'universal/components/Panel/Panel'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import AtlassianProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/AtlassianProviderRow'
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow'
import {GITHUB, SLACK} from 'universal/utils/constants'

interface Props {
  viewer: ProviderList_viewer
  teamId: string
  retry: () => void
}

const ProviderList = (props: Props) => {
  const {viewer, retry, teamId} = props
  const {
    providerMap,
    featureFlags: {jira}
  } = viewer
  const {atlassianAuth} = viewer
  return (
    <SettingsWrapper>
      <Panel hideFirstRowBorder>
        {jira && (
          <AtlassianProviderRow
            teamId={teamId}
            isAuthed={atlassianAuth ? atlassianAuth.isActive : false}
            retry={retry}
            viewer={viewer}
          />
        )}
        <ProviderRow name={GITHUB} providerDetails={providerMap[GITHUB]} teamId={teamId} />
        <ProviderRow name={SLACK} providerDetails={providerMap[SLACK]} teamId={teamId} />
      </Panel>
    </SettingsWrapper>
  )
}

graphql`
  fragment ProviderListAuth on User {
    atlassianAuth(teamId: $teamId) {
      isActive
    }
  }
`

export default createFragmentContainer(
  ProviderList,
  graphql`
    fragment ProviderList_viewer on User {
      featureFlags {
        jira
      }
      providerMap(teamId: $teamId) {
        GitHubIntegration {
          ...ProviderRow_providerDetails
        }
        SlackIntegration {
          ...ProviderRow_providerDetails
        }
      }
      ...AtlassianProviderRow_viewer
      ...ProviderListAuth @relay(mask: false)
    }
  `
)
