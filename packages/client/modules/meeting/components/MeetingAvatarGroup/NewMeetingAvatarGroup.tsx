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
import isDemoRoute from '../../../../utils/isDemoRoute'

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

const OverflowCount = styled('div')({
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
    height: 56,
    lineHeight: '56px',
    maxWidth: 56,
    width: 56
  }
})

const GroupLabel = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 13,
  marginRight: 16
})

interface Props {
  team: NewMeetingAvatarGroup_team
  camStreams: StreamUserDict
  swarm: MediaSwarm | null
  allowVideo: boolean
}

const NewMeetingAvatarGroup = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {swarm, team, camStreams, allowVideo} = props
  const {teamMembers} = team
  const isOverflowBreakpoint = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)

  // all connected teamMembers except self
  // TODO: filter by team members who are actually viewing “this” meeting view
  const connectedTeamMembers =
    teamMembers &&
    useMemo(() => teamMembers.filter(({isSelf, isConnected}) => !isSelf && isConnected), [
      teamMembers
    ])
  // const connectedTeamMembers = teamMembers
  // console.log(teamMembers.length, 'teamMembers.length')
  // console.log(connectedTeamMembers.length, 'teamMembers.length')

  const self = teamMembers && useMemo(() => teamMembers.find(({isSelf}) => isSelf), [teamMembers])
  // on mobile, show self and 2 other avatars, or self + count
  const overflowMobileThreshold = 3
  const showOverflowMobile =
    !isOverflowBreakpoint && connectedTeamMembers.length > overflowMobileThreshold
  // on laptop+, show self and 7 other avatars, or self and 6 other avatars + count
  const overflowLaptopThreshold = 7
  const showOverflowLaptop =
    isOverflowBreakpoint && connectedTeamMembers.length > overflowLaptopThreshold
  const overflowCount =
    (showOverflowMobile && connectedTeamMembers.length) ||
    (showOverflowLaptop && connectedTeamMembers.length - overflowLaptopThreshold)
  // on laptop+, slice off the first few to show if past threshold
  const otherTeamMembers = showOverflowLaptop
    ? connectedTeamMembers.slice(0, overflowLaptopThreshold - 1)
    : connectedTeamMembers
  return (
    <MeetingAvatarGroupRoot>
      <VideoControls
        allowVideo={allowVideo}
        swarm={swarm}
        localStreamUI={camStreams[atmosphere.viewerId]}
      />
      {/* {!isDemoRoute() && isOverflowBreakpoint && <GroupLabel>Connected</GroupLabel>} */}
      {self && (
        <OverlappingBlock key={self.id}>
          <NewMeetingAvatar teamMember={self} streamUI={camStreams[self.userId]} swarm={swarm} />
        </OverlappingBlock>
      )}
      {!showOverflowMobile &&
        teamMembers &&
        otherTeamMembers.map((teamMember) => {
          return (
            <OverlappingBlock key={teamMember.id}>
              <NewMeetingAvatar
                teamMember={teamMember}
                streamUI={camStreams[teamMember.userId]}
                swarm={swarm}
              />
            </OverlappingBlock>
          )
        })}
      {overflowCount && (
        <OverlappingBlock>
          <OverflowCount>{`+${overflowCount}`}</OverflowCount>
        </OverlappingBlock>
      )}
      <OverlappingBlock>
        <AddTeamMemberAvatarButton isMeeting team={team} teamMembers={teamMembers} />
      </OverlappingBlock>
    </MeetingAvatarGroupRoot>
  )
}

export default createFragmentContainer(NewMeetingAvatarGroup, {
  team: graphql`
    fragment NewMeetingAvatarGroup_team on Team {
      teamId: id
      ...AddTeamMemberAvatarButton_team
      teamMembers(sortBy: "checkInOrder") {
        ...AddTeamMemberAvatarButton_teamMembers
        id
        isConnected
        isSelf
        userId
        ...NewMeetingAvatar_teamMember
      }
    }
  `
})
