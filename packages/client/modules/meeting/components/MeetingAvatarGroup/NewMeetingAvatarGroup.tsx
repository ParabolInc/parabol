import {NewMeetingAvatarGroup_team} from '../../../../__generated__/NewMeetingAvatarGroup_team.graphql'
import React, {useMemo} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import AddTeamMemberAvatarButton from '../../../../components/AddTeamMemberAvatarButton'
import NewMeetingAvatar from './NewMeetingAvatar'
import VideoControls from '../../../../components/VideoControls'
import {StreamUserDict} from '../../../../hooks/useSwarm'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import MediaSwarm from '../../../../utils/swarm/MediaSwarm'
import {PALETTE} from '../../../../styles/paletteV2'
import {meetingAvatarMediaQueries} from '../../../../styles/meeting'
import {Breakpoint} from '../../../../types/constEnums'
import useHotkey from '../../../../hooks/useHotkey'
import useForceUpdate from '../../../../hooks/useForceUpdate'
import {commitLocalUpdate} from 'relay-runtime'
import useTransition, {TransitionStatus} from '../../../../hooks/useTransition'
import {DECELERATE} from '../../../../styles/animation'

const MeetingAvatarGroupRoot = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  position: 'relative',
  textAlign: 'center'
})

const OverlappingBlock = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_MAIN,
  borderRadius: '100%',
  marginLeft: -8,
  padding: 2,
  position: 'relative',
  ':first-of-type': {
    marginLeft: 0
  },
  [meetingAvatarMediaQueries[0]]: {
    marginLeft: -14,
    padding: 3
  }
})

const OverflowCount = styled('div')(({status}) => ({
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transition: `all 300ms ${DECELERATE}`,
  backgroundColor: PALETTE.BACKGROUND_BLUE,
  borderRadius: '100%',
  color: '#FFFFFF',
  fontSize: 11,
  fontWeight: 600,
  height: 32,
  lineHeight: '32px',
  maxWidth: 32,
  paddingRight: 4,
  textAlign: 'center',
  userSelect: 'none',
  width: 32,
  [meetingAvatarMediaQueries[0]]: {
    fontSize: 14,
    height: 48,
    lineHeight: '48px',
    maxWidth: 48,
    paddingRight: 8,
    width: 48
  },
  [meetingAvatarMediaQueries[1]]: {
    fontSize: 16,
    height: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56,
    lineHeight: '56px',
    maxWidth: 56,
    width: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56
  }
}))

interface Props {
  team: NewMeetingAvatarGroup_team
  camStreams: StreamUserDict
  swarm: MediaSwarm | null
  allowVideo: boolean
}

const MAX_AVATARS_DESKTOP = 3
const MAX_AVATARS_MOBILE = 3
const NewMeetingAvatarGroup = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {swarm, team, camStreams, allowVideo} = props
  const {teamMembers} = team
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const forceUpdate = useForceUpdate()
  const connector = (userId) => () => {
    commitLocalUpdate(atmosphere, (store) => {
      const userP = store.get(userId)
      userP.setValue(!userP.getValue('isConnected'), 'isConnected')
      userP.setValue(Date.now(), 'lastSeenAt')
    })
    forceUpdate()
  }
  useHotkey('1', connector('google-oauth2|108848476822908708026'))
  useHotkey('2', connector('auth0|57f52755a5ec618828a1c1e4'))
  useHotkey('3', connector('google-oauth2|112540584686400405659'))
  useHotkey('4', connector('google-oauth2|104933228229706489335'))

  // all connected teamMembers except self
  // TODO: filter by team members who are actually viewing “this” meeting view
  const connectedTeamMembers = useMemo(() => {
    return teamMembers
      .filter(({user}) => user.isConnected)
      .sort((a, b) => (a.userId === viewerId ? -1 : a.user.lastSeenAt < b.user.lastSeenAt ? -1 : 1))
      .map((tm) => ({
        ...tm,
        key: tm.userId
      }))
  }, [teamMembers])
  const overflowThreshold = isDesktop ? MAX_AVATARS_DESKTOP : MAX_AVATARS_MOBILE
  const visibleConnectedTeamMembers = connectedTeamMembers.slice(0, overflowThreshold)
  const hiddenTeamMemberCount = connectedTeamMembers.length - visibleConnectedTeamMembers.length
  const allAvatars =
    hiddenTeamMemberCount === 0
      ? visibleConnectedTeamMembers
      : visibleConnectedTeamMembers.concat({key: 'overflow'})
  const tranChildren = useTransition(allAvatars)
  return (
    <MeetingAvatarGroupRoot>
      <VideoControls
        allowVideo={allowVideo}
        swarm={swarm}
        localStreamUI={camStreams[atmosphere.viewerId]}
      />

      {tranChildren.map((teamMember) => {
        if (teamMember.child.key === 'overflow') {
          return (
            <OverlappingBlock key={'overflow'}>
              <OverflowCount
                status={teamMember.status}
                onTransitionEnd={teamMember.onTransitionEnd}
              >{`+${hiddenTeamMemberCount}`}</OverflowCount>
            </OverlappingBlock>
          )
        }
        return (
          <OverlappingBlock key={teamMember.child.id}>
            <NewMeetingAvatar
              teamMember={teamMember.child}
              onTransitionEnd={teamMember.onTransitionEnd}
              status={teamMember.status}
              streamUI={camStreams[teamMember.child.userId]}
              swarm={swarm}
            />
          </OverlappingBlock>
        )
      })}
      <OverlappingBlock>
        <AddTeamMemberAvatarButton isMeeting team={team} teamMembers={teamMembers} />
      </OverlappingBlock>
    </MeetingAvatarGroupRoot>
  )
}

export default createFragmentContainer(NewMeetingAvatarGroup, {
  team: graphql`
    fragment NewMeetingAvatarGroup_team on Team {
      ...AddTeamMemberAvatarButton_team
      teamMembers(sortBy: "checkInOrder") {
        ...AddTeamMemberAvatarButton_teamMembers
        id
        checkInOrder
        user {
          isConnected
          lastSeenAt
        }
        userId
        ...NewMeetingAvatar_teamMember
      }
    }
  `
})
