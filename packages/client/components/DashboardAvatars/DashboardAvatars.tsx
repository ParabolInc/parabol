import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import useAvatarsOverflow from '../../hooks/useAvatarsOverflow'
import {PALETTE} from '../../styles/paletteV3'
import {DashboardAvatars_team} from '../../__generated__/DashboardAvatars_team.graphql'
import ErrorBoundary from '../ErrorBoundary'
import DashboardAvatar from './DashboardAvatar'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const AvatarsList = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  marginTop: 16,
  width: '75%',
  [desktopBreakpoint]: {
    marginTop: 0,
    width: `${24 * 10}px` // TODO: change to the correct measurement
  }
})

const ScrollContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  overflow: 'hidden'
})

const ItemBlock = styled('div')({
  marginRight: 8,
  position: 'relative',
  [desktopBreakpoint]: {
    marginRight: 0,
    marginBottom: 4
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
  height: 24,
  justifyContent: 'center',
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  overflow: 'hidden',
  userSelect: 'none',
  width: 24
})

const Label = styled('div')({
  fontSize: 12,
  fontWeight: 600,
  color: PALETTE.SLATE_700,
  textAlign: 'center',
  width: '100%'
})

const DashboardAvatars = (props: Props) => {
  const {team} = props
  const {isLead: isViewerLead, teamMembers} = team
  const wrapperRef = useRef<HTMLDivElement>(null)
  const avatarsRef = useRef<HTMLDivElement>(null)
  const maxAvatars = useAvatarsOverflow(wrapperRef, avatarsRef)
  const overflowCount = teamMembers.length > maxAvatars ? teamMembers.length - maxAvatars + 1 : 0
  const visibleAvatars = overflowCount === 0 ? teamMembers : teamMembers.slice(0, maxAvatars - 1)
  return (
    <AvatarsList ref={wrapperRef}>
      <ScrollContainer ref={avatarsRef}>
        {visibleAvatars.map((teamMember) => {
          return (
            <ItemBlock key={`dbAvatar${teamMember.id}`}>
              <ErrorBoundary>
                <DashboardAvatar isViewerLead={isViewerLead} teamMember={teamMember} />
              </ErrorBoundary>
            </ItemBlock>
          )
        })}
        {overflowCount > 0 && (
          <ItemBlock>
            <OverflowCount>{`+${overflowCount}`}</OverflowCount>
          </ItemBlock>
        )}
      </ScrollContainer>
      <Label>Manage Team</Label>
    </AvatarsList>
  )
}

export default createFragmentContainer(DashboardAvatars, {
  team: graphql`
    fragment DashboardAvatars_team on Team {
      isLead
      teamMembers(sortBy: "preferredName") {
        ...AddTeamMemberAvatarButton_teamMembers
        ...DashboardAvatar_teamMember
        id
      }
    }
  `
})
