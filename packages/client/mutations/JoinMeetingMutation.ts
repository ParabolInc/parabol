import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {INewMeeting, ITeamMember, MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '../types/graphql'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import {JoinMeetingMutation as TJoinMeetingMutation} from '../__generated__/JoinMeetingMutation.graphql'

graphql`
  fragment JoinMeetingMutation_meeting on JoinMeetingSuccess {
    meeting {
      # probably a gross overfetch, but we can fix that later
      ...MeetingSelector_meeting
    }
  }
`

const mutation = graphql`
  mutation JoinMeetingMutation($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...JoinMeetingMutation_meeting @relay(mask: false)
    }
  }
`

const JoinMeetingMutation: StandardMutation<TJoinMeetingMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TJoinMeetingMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId} = variables
      const {viewerId} = atmosphere
      const meeting = store.get<INewMeeting>(meetingId)
      if (!meeting) return
      const meetingType = meeting.getValue('meetingType')
      const teamId = meeting.getValue('teamId')
      const meetingMember = createProxyRecord(store, 'MeetingMember', {
        meetingId,
        meetingType,
        teamId,
        userId: viewerId
      })
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get<ITeamMember>(teamMemberId)
      if (!teamMember) return
      const user = store.getRoot().getLinkedRecord('viewer')
      meetingMember.setLinkedRecord(teamMember, 'teamMember')
      meetingMember.setLinkedRecord(user, 'user')
      if (meetingType === MeetingTypeEnum.retrospective) {
        meetingMember.setValue(0, 'votesRemaining')
      }
      meeting.setLinkedRecord(meetingMember, 'viewerMeetingMember')

      const phases = meeting.getLinkedRecords('phases')
      const appendStage = (phaseType: NewMeetingPhaseTypeEnum) => {
        const phase = phases.find((phase) => phase.getValue('phaseType') === phaseType)
        if (!phase) return
        const stageLookup = {
          [NewMeetingPhaseTypeEnum.checkin]: 'CheckInStage',
          [NewMeetingPhaseTypeEnum.updates]: 'UpdatesStage'
        }
        const stageType = stageLookup[phaseType]
        const stage = createProxyRecord(store, stageType, {
          isComplete: false,
          isNavigable: false,
          isNavigableByFacilitator: false,
          teamMemberId,
          phaseType: NewMeetingPhaseTypeEnum.checkin,
          readyToAdvance: []
        })
        stage.setLinkedRecord(meetingMember, 'meetingMember')
        stage.setLinkedRecord(teamMember, 'teamMember')
        const stages = phase.getLinkedRecords('stages')
        const nextStages = [...stages, stage]
        phase.setLinkedRecords(nextStages, 'stages')
      }
      appendStage(NewMeetingPhaseTypeEnum.checkin)
      appendStage(NewMeetingPhaseTypeEnum.updates)
    },
    onError,
    onCompleted
  })
}

export default JoinMeetingMutation
