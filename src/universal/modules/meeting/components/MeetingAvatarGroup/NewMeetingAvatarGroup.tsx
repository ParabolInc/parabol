import {NewMeetingAvatarGroup_team} from '__generated__/NewMeetingAvatarGroup_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import AddTeamMemberAvatarButton from 'universal/components/AddTeamMemberAvatarButton'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {useGotoStageId} from 'universal/hooks/useMeeting'
import NewMeetingAvatar from 'universal/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatar'
import findStageById from 'universal/utils/meetings/findStageById'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import VideoControls from '../../../../components/VideoControls'
import {StreamUserDict} from '../../../../hooks/useSwarm'
import MediaSwarm from '../../../../utils/swarm/MediaSwarm'

const MeetingAvatarGroupRoot = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  position: 'relative',
  textAlign: 'center'
})

interface Props extends WithAtmosphereProps {
  gotoStageId: ReturnType<typeof useGotoStageId>
  team: NewMeetingAvatarGroup_team
  camStreams: StreamUserDict
  swarm: MediaSwarm | null
  allowVideo: boolean
}

const NewMeetingAvatarGroup = (props: Props) => {
  const {atmosphere, swarm, gotoStageId, team, camStreams, allowVideo} = props
  const {newMeeting, teamMembers} = team
  const meeting = newMeeting || UNSTARTED_MEETING
  const {facilitatorStageId, phases, localPhase} = meeting
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorStageTeamMemberId = facilitatorStageRes && facilitatorStageRes.stage.teamMemberId

  const gotoStage = (teamMemberId) => () => {
    const teamMemberStage =
      localPhase && localPhase.stages.find((stage) => stage.teamMemberId === teamMemberId)
    const teamMemberStageId = (teamMemberStage && teamMemberStage.id) || ''
    gotoStageId(teamMemberStageId).catch()
  }

  return (
    <MeetingAvatarGroupRoot>
      <VideoControls
        allowVideo={allowVideo}
        swarm={swarm}
        localStreamUI={camStreams[atmosphere.viewerId]}
      />
      {teamMembers.map((teamMember) => {
        return (
          <NewMeetingAvatar
            key={teamMember.id}
            gotoStage={gotoStage(teamMember.id)}
            isFacilitatorStage={facilitatorStageTeamMemberId === teamMember.id}
            newMeeting={newMeeting}
            teamMember={teamMember}
            streamUI={camStreams[teamMember.userId]}
            swarm={swarm}
          />
        )
      })}
      <AddTeamMemberAvatarButton isMeeting team={team} teamMembers={teamMembers} />
    </MeetingAvatarGroupRoot>
  )
}

graphql`
  fragment NewMeetingAvatarGroupPhases on NewMeetingPhase {
    id
    phaseType
    stages {
      id
      ... on NewMeetingTeamMemberStage {
        teamMemberId
      }
    }
  }
`

export default createFragmentContainer(
  withAtmosphere(NewMeetingAvatarGroup),
  graphql`
    fragment NewMeetingAvatarGroup_team on Team {
      teamId: id
      ...AddTeamMemberAvatarButton_team
      teamMembers(sortBy: "checkInOrder") {
        ...AddTeamMemberAvatarButton_teamMembers
        id
        userId
        ...NewMeetingAvatar_teamMember
      }
      newMeeting {
        facilitatorStageId
        localPhase {
          ...NewMeetingAvatarGroupPhases @relay(mask: false)
        }
        phases {
          ...NewMeetingAvatarGroupPhases @relay(mask: false)
        }
        ...NewMeetingAvatar_newMeeting
      }
    }
  `
)
