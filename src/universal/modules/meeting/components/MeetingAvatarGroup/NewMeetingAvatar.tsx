import {NewMeetingAvatar_newMeeting} from '__generated__/NewMeetingAvatar_newMeeting.graphql'
import {NewMeetingAvatar_teamMember} from '__generated__/NewMeetingAvatar_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {connect} from 'react-redux'
import {createFragmentContainer, graphql} from 'react-relay'
import VideoAvatar from 'universal/components/Avatar/VideoAvatar'
import LoadableMenu from 'universal/components/LoadableMenu'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import LoadableNewMeetingAvatarMenu from 'universal/modules/meeting/components/LoadableNewMeetingAvatarMenu'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {NewMeetingTeamMemberStage} from 'universal/types/graphql'
import {CHECKIN, UPDATES} from 'universal/utils/constants'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import {StreamUI} from '../../../../hooks/useSwarm'
import MediaSwarm from '../../../../utils/swarm/MediaSwarm'

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
    height: 36,
    width: 36,
    maxWidth: 36,
    [ui.breakpoint.wide]: {
      height: 40,
      width: 40,
      maxWidth: 40
    },
    [ui.breakpoint.wider]: {
      height: 48,
      width: 48,
      maxWidth: 48
    },
    [ui.breakpoint.widest]: {
      height: 64,
      width: 64,
      maxWidth: 64
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
  streamUI: StreamUI | undefined
  swarm: MediaSwarm
}

const NewMeetingAvatar = (props: Props) => {
  const {gotoStage, isFacilitatorStage, newMeeting, teamMember, streamUI, swarm} = props
  const meeting = newMeeting || UNSTARTED_MEETING
  const {facilitatorUserId, localPhase, localStage} = meeting
  const localPhaseType = localPhase && localPhase.phaseType
  const canNavigate = localPhaseType === CHECKIN || localPhaseType === UPDATES
  const {teamMemberId, userId} = teamMember
  const avatarIsFacilitating = userId === facilitatorUserId
  const handleNavigate = canNavigate ? gotoStage : undefined
  return (
    <ErrorBoundary>
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
            maxWidth={400}
            maxHeight={225}
            originAnchor={originAnchor}
            queryVars={{
              handleNavigate,
              newMeeting,
              teamMember
            }}
            targetAnchor={targetAnchor}
            toggle={<VideoAvatar teamMember={teamMember} streamUI={streamUI} swarm={swarm} />}
          />
        </AvatarBlock>
        {avatarIsFacilitating && <FacilitatorTag>{'Facilitator'}</FacilitatorTag>}
      </Item>
    </ErrorBoundary>
  )
}

export default createFragmentContainer(
  (connect as any)()(withAtmosphere(NewMeetingAvatar)),
  graphql`
    fragment NewMeetingAvatar_teamMember on TeamMember {
      teamMemberId: id
      meetingMember {
        isCheckedIn
      }
      picture
      userId
      user {
        isConnected
      }
      ...NewMeetingAvatarMenu_teamMember
      ...VideoAvatar_teamMember
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
