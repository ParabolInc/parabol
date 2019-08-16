import {NewMeetingAvatarMenu_newMeeting} from '../../../__generated__/NewMeetingAvatarMenu_newMeeting.graphql'
import {NewMeetingAvatarMenu_teamMember} from '../../../__generated__/NewMeetingAvatarMenu_teamMember.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DropdownMenuLabel from '../../../components/DropdownMenuLabel'
import MenuItem from '../../../components/MenuItem'
import Menu from '../../../components/Menu'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import PromoteNewMeetingFacilitatorMutation from '../../../mutations/PromoteNewMeetingFacilitatorMutation'
import {LOBBY} from '../../../utils/constants'
import {phaseLabelLookup} from '../../../utils/meetings/lookups'
import UNSTARTED_MEETING from '../../../utils/meetings/unstartedMeeting'

interface Props extends WithAtmosphereProps {
  newMeeting: NewMeetingAvatarMenu_newMeeting
  teamMember: NewMeetingAvatarMenu_teamMember
  menuProps: MenuProps
  handleNavigate?: () => void
}

const NewMeetingAvatarMenu = (props: Props) => {
  const {atmosphere, newMeeting, teamMember, menuProps, handleNavigate} = props
  const meeting = newMeeting || UNSTARTED_MEETING
  const {localPhase, facilitatorUserId, meetingId} = meeting
  const {meetingMember, isConnected, isSelf, preferredName, userId} = teamMember
  const isCheckedIn = meetingMember ? meetingMember.isCheckedIn : null
  const connected = isConnected ? 'connected' : 'disconnected'
  const checkedIn = isCheckedIn ? ' and checked in' : ''
  const headerLabel = `${isSelf ? 'You are' : `${preferredName} is`} ${connected} ${checkedIn}`
  const promoteToFacilitator = () => {
    PromoteNewMeetingFacilitatorMutation(atmosphere, {facilitatorUserId: userId, meetingId})
  }
  const avatarIsFacilitating = teamMember.userId === facilitatorUserId
  const phaseLabel = localPhase ? phaseLabelLookup[localPhase.phaseType] : LOBBY
  const owner = isSelf ? 'your' : `${preferredName}’s`
  return (
    <Menu ariaLabel={'Select what to do with this team member'} {...menuProps}>
      <DropdownMenuLabel>{headerLabel}</DropdownMenuLabel>
      {handleNavigate && (
        <MenuItem
          key='handleNavigate'
          label={`See ${owner} ${phaseLabel}`}
          onClick={handleNavigate}
        />
      )}
      {localPhase &&
        !avatarIsFacilitating &&
        isConnected &&
        !window.location.pathname.startsWith('/retrospective-demo') && (
          <MenuItem
            key='promoteToFacilitator'
            label={`Promote ${isSelf ? 'yourself' : preferredName} to Facilitator`}
            onClick={promoteToFacilitator}
          />
        )}
    </Menu>
  )
}

export default createFragmentContainer(withAtmosphere(NewMeetingAvatarMenu), {
  newMeeting: graphql`
    fragment NewMeetingAvatarMenu_newMeeting on NewMeeting {
      meetingId: id
      facilitatorUserId
      localPhase {
        phaseType
      }
    }
  `,
  teamMember: graphql`
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
})
