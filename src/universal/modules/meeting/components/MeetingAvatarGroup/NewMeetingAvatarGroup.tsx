import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'
import {NewMeetingAvatarGroup_team} from '__generated__/NewMeetingAvatarGroup_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {connect} from 'react-redux'
import {createFragmentContainer, graphql} from 'react-relay'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import NewMeetingAvatar from 'universal/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatar'
import findStageById from 'universal/utils/meetings/findStageById'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import AddTeamMemberAvatarButton from 'universal/components/AddTeamMemberAvatarButton'
import {StreamDict} from '../../../../hooks/useSwarm'
import OutlinedButton from 'universal/components/OutlinedButton'

const MeetingAvatarGroupRoot = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'flex-end',
  padding: '1rem 0'
})

const MeetingAvatarGroupInner = styled('div')({
  display: 'flex',
  position: 'relative',
  textAlign: 'center'
})

interface Props extends WithAtmosphereProps {
  gotoStageId: (stageId: string) => void
  team: NewMeetingAvatarGroup_team
  streams: StreamDict
  swarm: FastRTCSwarm | null
}

const AddVideoButton = styled(OutlinedButton)({
  fontSize: '1.5rem',
  fontWeight: 400,
  height: 32,
  marginLeft: '1rem',
  padding: 0,
  width: 32
})
const NewMeetingAvatarGroup = (props: Props) => {
  const {swarm, gotoStageId, team, streams} = props
  const {newMeeting, teamMembers} = team
  const meeting = newMeeting || UNSTARTED_MEETING
  const {facilitatorStageId, phases, localPhase} = meeting
  const facilitatorStageRes = findStageById(phases, facilitatorStageId)
  const facilitatorStageTeamMemberId = facilitatorStageRes && facilitatorStageRes.stage.teamMemberId
  return (
    <MeetingAvatarGroupRoot>
      <MeetingAvatarGroupInner>
        <AddVideoButton onClick={() => swarm && swarm.addMedia({audio: true, video: true})}>
          Add Video
        </AddVideoButton>
        {teamMembers.map((teamMember) => {
          return (
            // @ts-ignore
            <NewMeetingAvatar
              key={teamMember.id}
              gotoStage={() => {
                const teamMemberStage =
                  localPhase &&
                  localPhase.stages.find((stage) => stage.teamMemberId === teamMember.id)
                const teamMemberStageId = (teamMemberStage && teamMemberStage.id) || ''
                gotoStageId(teamMemberStageId)
              }}
              isFacilitatorStage={facilitatorStageTeamMemberId === teamMember.id}
              newMeeting={newMeeting}
              teamMember={teamMember}
              streamUI={streams[teamMember.userId]}
            />
          )
        })}
        <AddTeamMemberAvatarButton isMeeting team={team} teamMembers={teamMembers} />
      </MeetingAvatarGroupInner>
    </MeetingAvatarGroupRoot>
  )
}

export default createFragmentContainer(
  connect()(withAtmosphere(NewMeetingAvatarGroup)),
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
          id
          stages {
            id
            ... on NewMeetingTeamMemberStage {
              teamMemberId
            }
          }
        }
        phases {
          phaseType
          stages {
            id
            # here to ensure it exists on localPhase
            ... on NewMeetingTeamMemberStage {
              teamMemberId
            }
          }
        }
        ...NewMeetingAvatar_newMeeting
      }
    }
  `
)
