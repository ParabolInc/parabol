import {ProviderList_viewer} from '__generated__/ProviderList_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import AtlassianProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/AtlassianProviderRow'
import GitHubProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/GitHubProviderRow'
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow'
import {SLACK} from 'universal/utils/constants'
import SlackProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/SlackProviderRow'

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
      <GitHubProviderRow teamId={teamId} viewer={viewer} />
      <SlackProviderRow teamId={teamId} viewer={viewer} />
      <ProviderRow name={SLACK} providerDetails={providerMap[SLACK]} teamId={teamId} />
    </StyledWrapper>
  )
}

export default createFragmentContainer(
  ProviderList,
  graphql`
    fragment ProviderList_viewer on User {
      ...AtlassianProviderRow_viewer
      ...GitHubProviderRow_viewer
      ...SlackProviderRow_viewer
    }
  `
)
