import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import renderQuery from '../utils/relay/renderQuery'
import MeetingCardOptionsMenu from './MeetingCardOptionsMenu'

const query = graphql`
  query MeetingCardOptionsMenuRootQuery($teamId: ID!, $meetingId: ID) {
    viewer {
      ...MeetingCardOptionsMenu_viewer
    }
  }
`

interface Props {
  meetingId: string
  teamId: string
  menuProps: MenuProps
  popTooltip: () => void
}

const MeetingCardOptionsMenuRoot = (props: Props) => {
  const {meetingId, teamId, menuProps, popTooltip} = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId, teamId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MeetingCardOptionsMenu, {props: {menuProps, popTooltip}})}
    />
  )
}

export default MeetingCardOptionsMenuRoot
