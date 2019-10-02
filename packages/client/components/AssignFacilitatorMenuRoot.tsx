import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import QueryRenderer from '../components/QueryRenderer/QueryRenderer'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import AssignFacilitatorMenu from './AssignFacilitatorMenu'
import {cacheConfig} from '../utils/constants'
import renderQuery from '../utils/relay/renderQuery'
import {AssignFacilitatorMenuRoot_team} from '../__generated__/AssignFacilitatorMenuRoot_team.graphql'
import {AssignFacilitatorMenuRoot_newMeeting} from '../__generated__/AssignFacilitatorMenuRoot_newMeeting.graphql'

const query = graphql`
  query AssignFacilitatorMenuRootQuery($teamId: ID!) {
    viewer {
      ...AssignFacilitatorMenu_viewer
    }
  }
`

interface Props {
  menuProps: MenuProps
  team: AssignFacilitatorMenuRoot_team
  newMeeting: AssignFacilitatorMenuRoot_newMeeting
}

const AssignFacilitatorMenuRoot = (props: Props) => {
  const {menuProps, team, newMeeting} = props
  const atmosphere = useAtmosphere()
  const {teamId} = team
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      variables={{teamId}}
      query={query}
      render={renderQuery(AssignFacilitatorMenu, {props: {menuProps, team, newMeeting}})}
    />
  )
}

export default createFragmentContainer(AssignFacilitatorMenuRoot, {
  team: graphql`
    fragment AssignFacilitatorMenuRoot_team on Team {
      teamId: id
    }
  `,
  newMeeting: graphql`
    fragment AssignFacilitatorMenuRoot_newMeeting on NewMeeting {
      ...AssignFacilitatorMenu_newMeeting
    }
  `
})

