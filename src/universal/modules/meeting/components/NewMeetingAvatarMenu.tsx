import {NewMeetingAvatarMenu_newMeeting} from '__generated__/NewMeetingAvatarMenu_newMeeting.graphql'
import {NewMeetingAvatarMenu_teamMember} from '__generated__/NewMeetingAvatarMenu_teamMember.graphql'
import React from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import PromoteNewMeetingFacilitatorMutation from 'universal/mutations/PromoteNewMeetingFacilitatorMutation'
import {LOBBY} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import {Dispatch} from 'redux'

interface Props extends WithAtmosphereProps {
  dispatch: Dispatch<any>
  newMeeting: NewMeetingAvatarMenu_newMeeting
  teamMember: NewMeetingAvatarMenu_teamMember
  closePortal: () => void
  handleNavigate?: () => void
}

const NewMeetingAvatarMenu = (props: Props) => {
  const {atmosphere, dispatch, newMeeting, teamMember, closePortal, handleNavigate} = props
  const meeting = newMeeting || UNSTARTED_MEETING
  const {localPhase, facilitatorUserId, meetingId} = meeting
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
      <DropdownMenuLabel>{headerLabel}</DropdownMenuLabel>
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
  (connect as any)()(withAtmosphere(NewMeetingAvatarMenu)),
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
