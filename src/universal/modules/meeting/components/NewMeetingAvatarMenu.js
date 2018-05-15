// @flow
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts'
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts'
import styled from 'react-emotion'
import {connect, Dispatch} from 'react-redux'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {LOBBY} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import type {NewMeetingAvatarMenu_newMeeting as NewMeeting} from './__generated__/NewMeetingAvatarMenu_newMeeting.graphql'
import PromoteNewMeetingFacilitatorMutation from 'universal/mutations/PromoteNewMeetingFacilitatorMutation'
import textOverflow from 'universal/styles/helpers/textOverflow'

const Label = styled('div')({
  ...textOverflow,
  borderBottom: `1px solid ${appTheme.palette.mid30l}`,
  color: ui.palette.dark,
  fontSize: ui.menuItemFontSize,
  fontWeight: 600,
  lineHeight: ui.menuItemHeight,
  marginBottom: ui.menuGutterVertical,
  padding: `0 ${ui.menuGutterHorizontal}`,
  userSelect: 'none'
})

type Props = {
  atmosphere: Object,
  dispatch: Dispatch,
  newMeeting: NewMeeting,
  teamMember: Object,
  closePortal: () => void,
  handleNavigate: ?() => void
}

const NewMeetingAvatarMenu = (props: Props) => {
  const {atmosphere, dispatch, newMeeting, teamMember, closePortal, handleNavigate} = props
  const {localPhase, facilitatorUserId, meetingId} = newMeeting || {}
  const {meetingMember, isConnected, isSelf, preferredName, userId} = teamMember
  const isCheckedIn = meetingMember ? meetingMember.isCheckedIn : null
  const connected = isConnected ? 'connected' : 'disconnected'
  const checkedIn = isCheckedIn ? ' and checked in' : ''
  const headerLabel = `${isSelf ? 'You are' : `${preferredName} is`} ${connected} ${checkedIn}`
  const promoteToFacilitator = () => {
    PromoteNewMeetingFacilitatorMutation(
      atmosphere,
      {facilitatorUserId: userId, meetingId},
      {dispatch}
    )
  }
  const avatarIsFacilitating = teamMember.userId === facilitatorUserId
  const handlePromote = isConnected ? promoteToFacilitator : undefined
  const phaseLabel = localPhase ? phaseLabelLookup[localPhase.phaseType] : LOBBY
  const owner = isSelf ? 'your' : `${preferredName}’s`
  return (
    <MenuWithShortcuts
      ariaLabel={'Select what to do with this team member'}
      closePortal={closePortal}
    >
      <Label>{headerLabel}</Label>
      {handleNavigate && (
        <MenuItemWithShortcuts
          key='handleNavigate'
          label={`See ${owner} ${phaseLabel}`}
          onClick={handleNavigate}
        />
      )}
      {!avatarIsFacilitating && (
        <MenuItemWithShortcuts
          key='promoteToFacilitator'
          label={`Promote ${isSelf ? 'yourself' : preferredName} to Facilitator`}
          onClick={handlePromote}
        />
      )}
    </MenuWithShortcuts>
  )
}

export default createFragmentContainer(
  connect()(withAtmosphere(NewMeetingAvatarMenu)),
  graphql`
    fragment NewMeetingAvatarMenu_newMeeting on NewMeeting {
      meetingId: id
      facilitatorUserId
      localPhase {
        phaseType
      }
    }

    fragment NewMeetingAvatarMenu_teamMember on TeamMember {
      meetingMember {
        isCheckedIn
      }
      isConnected
      isSelf
      preferredName
      userId
    }
  `
)
