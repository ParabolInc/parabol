import {NewMeetingAvatar_newMeeting} from '__generated__/NewMeetingAvatar_newMeeting.graphql'
import {NewMeetingAvatar_teamMember} from '__generated__/NewMeetingAvatar_teamMember.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import VideoAvatar from 'universal/components/Avatar/VideoAvatar'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {NewMeetingTeamMemberStage} from 'universal/types/graphql'
import {CHECKIN, UPDATES} from 'universal/utils/constants'
import lazyPreload from 'universal/utils/lazyPreload'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import {StreamUI} from '../../../../hooks/useSwarm'
import MediaSwarm from '../../../../utils/swarm/MediaSwarm'

const borderActive = ui.palette.yellow
const borderLocal = appTheme.palette.mid30l
const boxShadowBase = '0 0 0 .125rem #fff, 0 0 0 .25rem'
const boxShadowWarm = `${boxShadowBase} ${borderActive}`
const boxShadowLocal = `${boxShadowBase} ${borderLocal}`

const Item = styled('div')({
  marginLeft: 12,
  position: 'relative',
  '&:first-child': {
    marginLeft: 0
  }
})

interface AvatarBlockProps {
  isLocalStage: boolean
  isFacilitatorStage: boolean
  isReadOnly: boolean
}

const AvatarBlock = styled('div')(
  {
    borderRadius: '100%',
    height: 32,
    width: 32,
    maxWidth: 32,
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
  fontSize: 11,
  fontWeight: 600,
  marginTop: 4,
  padding: '0 8px',
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
  swarm: MediaSwarm | null
}

const NewMeetingAvatarMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'NewMeetingAvatarMenu' */
  'universal/modules/meeting/components/NewMeetingAvatarMenu')
)

const NewMeetingAvatar = (props: Props) => {
  const {gotoStage, isFacilitatorStage, newMeeting, teamMember, streamUI, swarm} = props
  const meeting = newMeeting || UNSTARTED_MEETING
  const {facilitatorUserId, localPhase, localStage} = meeting
  const localPhaseType = localPhase && localPhase.phaseType
  const canNavigate = localPhaseType === CHECKIN || localPhaseType === UPDATES
  const {teamMemberId, userId} = teamMember
  const avatarIsFacilitating = userId === facilitatorUserId
  const handleNavigate = canNavigate ? gotoStage : undefined
  const {togglePortal, menuProps, menuPortal, originRef} = useMenu(MenuPosition.UPPER_RIGHT)
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
          <VideoAvatar
            ref={originRef}
            teamMember={teamMember}
            streamUI={streamUI}
            swarm={swarm}
            onClick={togglePortal}
            onMouseEnter={NewMeetingAvatarMenu.preload}
          />
        </AvatarBlock>
        {avatarIsFacilitating && <FacilitatorTag>{'Facilitator'}</FacilitatorTag>}
      </Item>
      {menuPortal(
        <NewMeetingAvatarMenu
          handleNavigate={handleNavigate}
          newMeeting={newMeeting!}
          teamMember={teamMember}
          menuProps={menuProps}
        />
      )}
    </ErrorBoundary>
  )
}

export default createFragmentContainer(
  withAtmosphere(NewMeetingAvatar),
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
