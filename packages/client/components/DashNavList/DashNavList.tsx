import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DashNavTeam from '../Dashboard/DashNavTeam'
import styled from '@emotion/styled'
import {DashNavList_viewer} from '../../__generated__/DashNavList_viewer.graphql'
// import SexyScrollbar from 'universal/components/Dashboard/SexyScrollbar'

const DashNavListStyles = styled('div')({
  width: '100%'
})

const EmptyTeams = styled('div')({
  fontSize: 16,
  fontStyle: 'italic',
  marginLeft: '2.1875rem'
})

interface Props {
  viewer: DashNavList_viewer | null
  onClick: () => void
}
const DashNavList = (props: Props) => {
  const {onClick, viewer} = props
  if (!viewer) return null
  const {teams} = viewer
  if (teams.length === 0) {
    return <EmptyTeams>It appears you are not a member of any team!</EmptyTeams>
  }
  return (
    <DashNavListStyles>
      {teams.map((team) => (
        <DashNavTeam key={team.id} team={team} onClick={onClick} />
      ))}
    </DashNavListStyles>
  )
}

// return (
//   <SexyScrollbar>
//     {(scrollRef) => {
//       return (
//         <DashNavListStyles ref={scrollRef}>
//           {teams.map((team) => <DashNavTeam key={team.id} location={location} team={team} />)}
//         </DashNavListStyles>
//       )
//     }}
//   </SexyScrollbar>
// )

export default createFragmentContainer(DashNavList, {
  viewer: graphql`
    fragment DashNavList_viewer on User {
      teams {
        id
        ...DashNavTeam_team
      }
    }
  `
})
