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
}
const ProviderList = (props: Props) => {
  const {viewer, teamId} = props
  const {
    providerMap,
    team,
    featureFlags: {jira}
  } = viewer
  if (!team) return null
  const {atlassianAuth, atlassianProjects} = team
  return (
    <SettingsWrapper>
      <Panel hideFirstRowBorder>
        {jira && (
          <AtlassianProviderRow
            teamId={teamId}
            isAuthed={!!atlassianAuth}
            projects={atlassianProjects}
          />
        )}
        <ProviderRow name={GITHUB} providerDetails={providerMap[GITHUB]} teamId={teamId} />
        <ProviderRow name={SLACK} providerDetails={providerMap[SLACK]} teamId={teamId} />
      </Panel>
    </SettingsWrapper>
  )
}

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
      team(teamId: $teamId) {
        atlassianAuth {
          id
        }
        atlassianProjects {
          ...AtlassianProviderRow_projects
        }
      }
    }
  `
)
