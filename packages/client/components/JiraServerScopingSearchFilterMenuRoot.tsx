// import graphql from 'babel-plugin-relay/macro'
// import React from 'react'
// import {QueryRenderer} from 'react-relay'
// import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
// import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

// const query = graphql`
//   query JiraServerScopingSearchFilterMenuRootQuery($teamId: ID!, $meetingId: ID!) {
//     viewer {
//       ...JiraScopingSearchFilterMenu_viewer
//     }
//   }
// `

interface Props {
  menuProps: MenuProps
  teamId: string
  meetingId: string
}

const JiraServerScopingSearchFilterMenuRoot = (props: Props) => {
  // const {menuProps, teamId, meetingId} = props
  // const atmosphere = useAtmosphere()
  if (props) {
  }

  // FIXME
  return null
}

export default JiraServerScopingSearchFilterMenuRoot
