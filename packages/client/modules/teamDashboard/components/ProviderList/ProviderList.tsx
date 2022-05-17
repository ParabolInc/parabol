import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import {ProviderListQuery} from '../../../../__generated__/ProviderListQuery.graphql'
import AtlassianProviderRow from '../ProviderRow/AtlassianProviderRow'
import AzureDevOpsProviderRow from '../ProviderRow/AzureDevOpsProviderRow'
import GitHubProviderRow from '../ProviderRow/GitHubProviderRow'
import GitLabProviderRow from '../ProviderRow/GitLabProviderRow'
import JiraServerProviderRow from '../ProviderRow/JiraServerProviderRow'
import MattermostProviderRow from '../ProviderRow/MattermostProviderRow'
import MSTeamsProviderRow from '../ProviderRow/MSTeamsProviderRow'
import SlackProviderRow from '../ProviderRow/SlackProviderRow'

interface Props {
  queryRef: PreloadedQuery<ProviderListQuery>
  teamId: string
  retry: () => void
}

const StyledWrapper = styled(SettingsWrapper)({
  display: 'block'
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

      featureFlags {
        azureDevOps
        gitlab
        msTeams
      }
    }
  }
`

const ProviderList = (props: Props) => {
  const {queryRef, retry, teamId} = props
  const data = usePreloadedQuery<ProviderListQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const {
    featureFlags: {azureDevOps: allowAzureDevOps, msTeams: allowMSTeams}
  } = viewer
  return (
    <StyledWrapper>
      <AtlassianProviderRow teamId={teamId} retry={retry} viewer={viewer} />
      <JiraServerProviderRow teamId={teamId} viewerRef={viewer} />
      <GitHubProviderRow teamId={teamId} viewer={viewer} />
      <GitLabProviderRow teamId={teamId} viewerRef={viewer} />
      <MattermostProviderRow teamId={teamId} viewerRef={viewer} />
      <SlackProviderRow teamId={teamId} viewer={viewer} />
      {allowAzureDevOps && <AzureDevOpsProviderRow teamId={teamId} viewerRef={viewer} />}
      {allowMSTeams && <MSTeamsProviderRow teamId={teamId} viewerRef={viewer} />}
    </StyledWrapper>
  )
}

export default ProviderList
