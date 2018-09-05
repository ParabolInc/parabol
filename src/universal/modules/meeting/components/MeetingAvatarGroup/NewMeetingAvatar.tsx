import {NewMeetingAvatar_newMeeting} from '__generated__/NewMeetingAvatar_newMeeting.graphql'
import {NewMeetingAvatar_teamMember} from '__generated__/NewMeetingAvatar_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {connect} from 'react-redux'
import {createFragmentContainer, graphql} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import LoadableMenu from 'universal/components/LoadableMenu'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import LoadableNewMeetingAvatarMenu from 'universal/modules/meeting/components/LoadableNewMeetingAvatarMenu'
import appTheme from 'universal/styles/theme/appTheme'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import ui from 'universal/styles/ui'
import {CHECKIN, UPDATES} from 'universal/utils/constants'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import NewMeetingTeamMemberStage = GQL.NewMeetingTeamMemberStage

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

const borderActive = ui.palette.yellow
const borderLocal = appTheme.palette.mid30l
const boxShadowBase = '0 0 0 .125rem #fff, 0 0 0 .25rem'
const boxShadowWarm = `${boxShadowBase} ${borderActive}`
const boxShadowLocal = `${boxShadowBase} ${borderLocal}`

const Item = styled('div')({
  marginLeft: '1rem',
  marginRight: '.25rem',
  position: 'relative'
})

interface AvatarBlockProps {
  isLocalStage: boolean
  isFacilitatorStage: boolean
  isReadOnly: boolean
}

const AvatarBlock = styled('div')(
  {
    borderRadius: '100%',
    width: '2.25rem',

    [ui.breakpoint.wide]: {
      width: '2.5rem'
    },
    [ui.breakpoint.wider]: {
      width: '3rem'
    },
    [ui.breakpoint.widest]: {
      width: '4rem'
    },

    ':hover': {
      opacity: 0.5
    }
  },
  ({isLocalStage, isFacilitatorStage, isReadOnly}: AvatarBlockProps) => {
    let boxShadow
    if (isFacilitatorStage) {
      boxShadow = boxShadowWarm
    } else if (isLocalStage) {
      boxShadow = boxShadowLocal
    } else if (isReadOnly) {
      boxShadow = 'none'
    }
    return {
      boxShadow
      // TS caught this one, not sure what the 1 does here
      // ':hover': isReadOnly ? 1 : undefined
    }
  }
)

const FacilitatorTag = styled('div')({
  backgroundColor: ui.palette.white,
  borderRadius: '4em',
  color: ui.palette.dark,
  fontSize: '.6875rem',
  fontWeight: 600,
  marginTop: '0.75rem',
  padding: '0 .5rem',
  position: 'absolute',
  right: '50%',
  transform: 'translateX(50%)'
})

interface Props extends WithAtmosphereProps {
  gotoStage: () => void
  isFacilitatorStage: boolean
  newMeeting: NewMeetingAvatar_newMeeting | null
  teamMember: NewMeetingAvatar_teamMember
}

const NewMeetingAvatar = (props: Props) => {
  const {gotoStage, isFacilitatorStage, newMeeting, teamMember} = props
  const meeting = newMeeting || UNSTARTED_MEETING
  const {facilitatorUserId, localPhase, localStage} = meeting
  const localPhaseType = localPhase && localPhase.phaseType
  const canNavigate = localPhaseType === CHECKIN || localPhaseType === UPDATES
  const {
    teamMemberId,
    isConnected,
    isSelf,
    meetingMember,
    picture = defaultUserAvatar,
    userId
  } = teamMember
  const isCheckedIn = meetingMember ? meetingMember.isCheckedIn : null
  const avatarIsFacilitating = userId === facilitatorUserId
  const handleNavigate = canNavigate ? gotoStage : undefined
  return (
    <Item>
      <AvatarBlock
        isReadOnly={!canNavigate}
        isLocalStage={
          localStage
            ? (localStage as NewMeetingTeamMemberStage).teamMemberId === teamMemberId
            : false
        }
        isFacilitatorStage={!!isFacilitatorStage}
      >
        <LoadableMenu
          LoadableComponent={LoadableNewMeetingAvatarMenu}
          maxWidth={350}
          maxHeight={225}
          originAnchor={originAnchor}
          queryVars={{
            handleNavigate,
            newMeeting,
            teamMember
          }}
          targetAnchor={targetAnchor}
          toggle={
            <Avatar
              hasBadge
              isClickable
              picture={picture}
              isConnected={isConnected || isSelf}
              isCheckedIn={isCheckedIn}
              size="fill"
            />
          }
        />
      </AvatarBlock>
      {avatarIsFacilitating && <FacilitatorTag>{'Facilitator'}</FacilitatorTag>}
    </Item>
  )
}

export default createFragmentContainer(
  connect()(withAtmosphere(NewMeetingAvatar)),
  graphql`
    fragment NewMeetingAvatar_teamMember on TeamMember {
      teamMemberId: id
      meetingMember {
        isCheckedIn
      }
      isConnected
      isSelf
      picture
      userId
      ...NewMeetingAvatarMenu_teamMember
    }

    fragment NewMeetingAvatar_newMeeting on NewMeeting {
      facilitatorUserId
      localStage {
        ... on NewMeetingTeamMemberStage {
          teamMemberId
        }
      }
      localPhase {
        phaseType
      }
      ...NewMeetingAvatarMenu_newMeeting
    }
  `
)
