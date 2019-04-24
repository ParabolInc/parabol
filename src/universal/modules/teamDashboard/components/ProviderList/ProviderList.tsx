import {ProviderList_viewer} from '__generated__/ProviderList_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import AtlassianProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/AtlassianProviderRow'
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow'
import {GITHUB, SLACK} from 'universal/utils/constants'
import styled from 'react-emotion'

interface Props {
  viewer: ProviderList_viewer
  teamId: string
  retry: () => void
}

const StyledWrapper = styled(SettingsWrapper)({
  paddingBottom: 8,
  paddingTop: 8
})

const ProviderList = (props: Props) => {
  const {viewer, retry, teamId} = props
  const {providerMap} = viewer
  return (
    <StyledWrapper>
      <AtlassianProviderRow teamId={teamId} retry={retry} viewer={viewer} />
      <ProviderRow name={GITHUB} providerDetails={providerMap[GITHUB]} teamId={teamId} />
      <ProviderRow name={SLACK} providerDetails={providerMap[SLACK]} teamId={teamId} />
    </StyledWrapper>
  )
}

export default createFragmentContainer(
  ProviderList,
  graphql`
    fragment ProviderList_viewer on User {
      providerMap(teamId: $teamId) {
        GitHubIntegration {
          ...ProviderRow_providerDetails
        }
        SlackIntegration {
          ...ProviderRow_providerDetails
        }
      }
      ...AtlassianProviderRow_viewer
    }
  `
)
