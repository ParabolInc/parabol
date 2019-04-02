import {AtlassianIntegrations_viewer} from '__generated__/AtlassianIntegrations_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import BasicCard from 'universal/components/BasicCard'
import JiraIntegrationHeader from 'universal/components/JiraIntegrationHeader'

const Panel = styled(BasicCard)({
  marginTop: 16,
  maxWidth: 500
})

interface Props {
  teamId: string
  viewer: AtlassianIntegrations_viewer
}

const AtlassianIntegrations = (props: Props) => {
  const {viewer, teamId} = props
  const {team} = viewer
  if (!team) return null
  const accessToken = (team.atlassianAuth && team.atlassianAuth.accessToken) || undefined
  return (
    <Panel>
      <JiraIntegrationHeader accessToken={accessToken} teamId={teamId} />
    </Panel>
  )
}

export default createFragmentContainer(
  AtlassianIntegrations,
  graphql`
    fragment AtlassianIntegrations_viewer on User {
      team(teamId: $teamId) {
        atlassianAuth {
          accessToken
        }
      }
    }
  `
)
