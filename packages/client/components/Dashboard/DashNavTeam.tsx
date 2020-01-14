import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {DashNavTeam_team} from '../../__generated__/DashNavTeam_team.graphql'
import LeftDashNavItem from './LeftDashNavItem'

interface Props {
  team: DashNavTeam_team
  onClick: () => void
}

const DashNavTeam = (props: Props) => {
  const {onClick, team} = props
  const {isPaid, name, id: teamId} = team
  const icon = isPaid ? 'group' : 'warning'
  return <LeftDashNavItem icon={icon} href={`/team/${teamId}`} label={name} onClick={onClick} />
}

export default createFragmentContainer(DashNavTeam, {
  team: graphql`
    fragment DashNavTeam_team on Team {
      id
      isPaid
      name
    }
  `
})
