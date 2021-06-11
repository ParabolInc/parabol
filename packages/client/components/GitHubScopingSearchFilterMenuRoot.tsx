import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer, QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import GitHubScopingSearchFilterMenu from './GitHubScopingSearchFilterMenu'
import {GitHubScopingSearchFilterMenuRoot_meeting} from '../__generated__/GitHubScopingSearchFilterMenuRoot_meeting.graphql'

const query = graphql`
  query GitHubScopingSearchFilterMenuRootQuery($teamId: ID!, $meetingId: ID!) {
    viewer {
      ...GitHubScopingSearchFilterMenu_viewer
    }
  }
`

interface Props {
  menuProps: MenuProps
  teamId: string
  meeting: GitHubScopingSearchFilterMenuRoot_meeting
}

const GitHubScopingSearchFilterMenuRoot = (props: Props) => {
  const {menuProps, teamId, meeting} = props
  const {id: meetingId} = meeting
  const atmosphere = useAtmosphere()

  return (
    <QueryRenderer
      variables={{teamId, meetingId}}
      environment={atmosphere}
      query={query}
      fetchPolicy={'store-or-network' as any}
      render={({props, error}) => {
        const viewer = (props as any)?.viewer ?? null
        return <GitHubScopingSearchFilterMenu viewer={viewer} error={error} menuProps={menuProps} />
      }}
    />
  )
}

export default createFragmentContainer(GitHubScopingSearchFilterMenuRoot, {
  meeting: graphql`
    fragment GitHubScopingSearchFilterMenuRoot_meeting on PokerMeeting {
      id
    }
  `
})
