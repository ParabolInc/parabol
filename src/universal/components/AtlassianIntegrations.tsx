import {AtlassianIntegrations_viewer} from '__generated__/AtlassianIntegrations_viewer.graphql'
import {decode} from 'jsonwebtoken'
import React, {useEffect} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import BasicCard from 'universal/components/BasicCard'
import JiraIntegrationHeader from 'universal/components/JiraIntegrationHeader'
import {IAuthToken} from 'universal/types/graphql'

const Panel = styled(BasicCard)({
  marginTop: 16,
  maxWidth: 500
})

interface Props {
  viewer: AtlassianIntegrations_viewer
  retry: () => void
}

const useFreshToken = (accessToken: string | undefined, retry: () => void) => {
  useEffect(() => {
    if (!accessToken) return
    const decodedToken = decode(accessToken) as IAuthToken | null
    const delay = (decodedToken && decodedToken.exp * 1000 - Date.now()) || -1
    if (delay <= 0) return
    const cancel = window.setTimeout(() => {
      retry()
    }, delay)
    return () => {
      window.clearTimeout(cancel)
    }
  }, [accessToken])
}

const AtlassianIntegrations = (props: Props) => {
  const {retry, viewer} = props
  const {team} = viewer
  if (!team) return null
  const accessToken = (team.atlassianAuth && team.atlassianAuth.accessToken) || undefined
  useFreshToken(accessToken, retry)
  return (
    <Panel>
      <JiraIntegrationHeader team={team} accessToken={accessToken} />
    </Panel>
  )
}

graphql`
  fragment AtlassianIntegrations_team on Team {
    atlassianAuth {
      accessToken
    }
  }
`

export default createFragmentContainer(
  AtlassianIntegrations,
  graphql`
    fragment AtlassianIntegrations_viewer on User {
      team(teamId: $teamId) {
        ...AtlassianIntegrations_team @relay(mask: false)
        ...JiraIntegrationHeader_team
        atlassianProjects {
          id
        }
      }
    }
  `
)
