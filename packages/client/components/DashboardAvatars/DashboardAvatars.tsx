import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import useAvatarsOverflow from '../../hooks/useAvatarsOverflow'
import {DashboardAvatars_team} from '../../__generated__/DashboardAvatars_team.graphql'
import AddTeamMemberAvatarButton from '../AddTeamMemberAvatarButton'
import ErrorBoundary from '../ErrorBoundary'
import DashboardAvatar from './DashboardAvatar'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const AvatarsList = styled('div')({
  display: 'flex',
  overflow: 'auto',
  marginTop: 16,
  maxWidth: '100%',
  [desktopBreakpoint]: {
    marginTop: 0,
    overflow: 'visible'
  }
})

const ItemBlock = styled('div')({
  marginRight: 8,
  position: 'relative',
  [desktopBreakpoint]: {
    marginBottom: 8,
    marginLeft: 8,
    marginRight: 0
  }
})

interface Props {
  avatarsRef: any
  team: DashboardAvatars_team
}

const DashboardAvatars = forwardRef((props: Props) => {
  const {avatarsRef, team} = props
  const {id: teamId, isLead: isViewerLead, teamMembers} = team
  const maxAvatars = useAvatarsOverflow(avatarsRef)
  const overflowCount = teamMembers.length > maxAvatars ? teamMembers.length - maxAvatars + 1 : 0
  const visibleAvatars =
    overflowCount === 0 ? teamMembers : (teamMembers.slice(0, maxAvatars - 1) as any)
  return (
    <AvatarsList>
      <ItemBlock>
        <AddTeamMemberAvatarButton teamId={teamId} teamMembers={teamMembers} />
      </ItemBlock>
      {visibleAvatars.map((teamMember) => {
        return (
          <ItemBlock key={`dbAvatar${teamMember.id}`}>
            <ErrorBoundary>
              <DashboardAvatar isViewerLead={isViewerLead} teamMember={teamMember} />
            </ErrorBoundary>
          </ItemBlock>
        )
      })}
      {overflowCount !== 0 && <div>overflow!</div>}
    </AvatarsList>
  )
})

export default createFragmentContainer(DashboardAvatars, {
  team: graphql`
    fragment DashboardAvatars_team on Team {
      id
      isLead
      teamMembers(sortBy: "preferredName") {
        ...AddTeamMemberAvatarButton_teamMembers
        ...DashboardAvatar_teamMember
        id
      }
    }
  `
})
