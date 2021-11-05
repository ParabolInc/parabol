import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {GitHubScopingSearchHistoryToggle_meeting$key} from '../__generated__/GitHubScopingSearchHistoryToggle_meeting.graphql'
import GitHubScopingSearchHistoryMenu from './GitHubScopingSearchHistoryMenu'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

const DropdownIcon = styled(Icon)({
  color: PALETTE.SLATE_700,
  fontSize: ICON_SIZE.MD18,
  marginLeft: -8
})

const Toggle = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingRight: 8
})
interface Props {
  meetingRef: GitHubScopingSearchHistoryToggle_meeting$key
}

const GitHubScopingSearchHistoryToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchHistoryToggle_meeting on PokerMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            ...GitHubScopingSearchHistoryMenu_teamMember
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, viewerMeetingMember} = meeting!
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT, {
    loadingWidth: 200,
    noClose: true
  })
  if (!viewerMeetingMember) return null
  const {teamMember} = viewerMeetingMember
  return (
    <>
      <Toggle onClick={togglePortal} ref={originRef}>
        <SearchIcon>search</SearchIcon>
        <DropdownIcon>expand_more</DropdownIcon>
      </Toggle>
      {menuPortal(
        <GitHubScopingSearchHistoryMenu
          meetingId={meetingId}
          menuProps={menuProps}
          teamMemberRef={teamMember}
        />
      )}
    </>
  )
}

export default GitHubScopingSearchHistoryToggle
