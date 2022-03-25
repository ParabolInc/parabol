import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import useAvatarsOverflow from '../../hooks/useAvatarsOverflow'
import {PALETTE} from '../../styles/paletteV3'
import {DashboardAvatars_team} from '../../__generated__/DashboardAvatars_team.graphql'
import AddTeamMemberAvatarButton from '../AddTeamMemberAvatarButton'
import ErrorBoundary from '../ErrorBoundary'
import DashboardAvatar from './DashboardAvatar'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const AvatarsList = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  marginTop: 16,
  width: '75%',
  [desktopBreakpoint]: {
    justifyContent: 'flex-end',
    marginTop: 0,
    width: '100%'
  }
})

const ScrollContainer = styled('div')({
  display: 'flex',
  maxWidth: '100%',
  overflow: 'hidden'
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
  team: DashboardAvatars_team
}

const OverflowCount = styled('div')({
  alignItems: 'center',
  backgroundColor: PALETTE.SKY_400,
  borderRadius: '50%',
  display: 'flex',
  height: 32,
  justifyContent: 'center',
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  overflow: 'hidden',
  userSelect: 'none',
  width: 32
})

const DashboardAvatars = (props: Props) => {
  const {team} = props
  const {id: teamId, isLead: isViewerLead, teamMembers} = team
  const wrapperRef = useRef<HTMLDivElement>(null)
  const avatarsRef = useRef<HTMLDivElement>(null)
  const maxAvatars = useAvatarsOverflow(wrapperRef, avatarsRef)
  const overflowCount = teamMembers.length > maxAvatars ? teamMembers.length - maxAvatars + 1 : 0
  const visibleAvatars = overflowCount === 0 ? teamMembers : teamMembers.slice(0, maxAvatars - 1)
  return (
    <AvatarsList ref={wrapperRef}>
      <ScrollContainer ref={avatarsRef}>
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
        {overflowCount > 2 && (
          <ItemBlock>
            <OverflowCount>{`+${overflowCount}`}</OverflowCount>
          </ItemBlock>
        )}
      </ScrollContainer>
    </AvatarsList>
  )
}

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
