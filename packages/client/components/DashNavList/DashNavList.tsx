import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {DashNavList_viewer} from '../../__generated__/DashNavList_viewer.graphql'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'

const DashNavListStyles = styled('div')({
  paddingRight: 8,
  width: '100%'
})

const EmptyTeams = styled('div')({
  fontSize: 16,
  fontStyle: 'italic',
  padding: 16,
  textAlign: 'center'
})

interface Props {
  className?: string
  viewer: DashNavList_viewer | null
  onClick?: () => void
}

const DashNavList = (props: Props) => {
  const {className, onClick, viewer} = props
  if (!viewer) return null
  const {teams} = viewer
  if (teams.length === 0) {
    return <EmptyTeams>It appears you are not a member of any team!</EmptyTeams>
  }
  return (
    <DashNavListStyles>
      {teams.map((team) => (
        <LeftDashNavItem
          className={className}
          onClick={onClick}
          key={team.id}
          icon={team.isPaid ? 'group' : 'warning'}
          href={`/team/${team.id}`}
          label={team.name}
        />
      ))}
    </DashNavListStyles>
  )
}

export default createFragmentContainer(DashNavList, {
  viewer: graphql`
    fragment DashNavList_viewer on User {
      teams {
        id
        isPaid
        name
      }
    }
  `
})
