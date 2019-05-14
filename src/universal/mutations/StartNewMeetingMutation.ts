import {StartNewMeetingMutation} from '__generated__/StartNewMeetingMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import handleMutationError from 'universal/mutations/handlers/handleMutationError'
import {IStartNewMeetingOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'
import updateLocalStage from 'universal/utils/relay/updateLocalStage'

graphql`
  fragment StartNewMeetingMutation_team on StartNewMeetingPayload {
    ...StartNewMeetingMutationOnNext @relay(mask: false)
    team {
      ...ActionMeetingTeam @relay(mask: false)
      ...RetroMeetingTeam @relay(mask: false)
      ...MeetingInProgressModal_team @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation StartNewMeetingMutation($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    startNewMeeting(teamId: $teamId, meetingType: $meetingType) {
      ...StartNewMeetingMutation_team @relay(mask: false)
    }
  }
`

graphql`
  fragment StartNewMeetingMutationOnNext on StartNewMeetingPayload {
    error {
      title
      message
    }
    team {
      newMeeting {
        phases {
          stages {
            id
          }
        }
      }
    }
  }
`

export const startNewMeetingTeamOnNext = (payload, context) => {
  const {atmosphere} = context
  const {
    error,
    team: {
      newMeeting: {
        id: meetingId,
        phases: [firstPhase]
      }
    }
  } = payload
  updateLocalStage(atmosphere, meetingId, firstPhase.stages[0].id)
  handleMutationError(error, context)
}

const StartNewMeetingMutation = (
  atmosphere: Atmosphere,
  variables: IStartNewMeetingOnMutationArguments,
  {history, onError, onCompleted}: LocalHandlers
) => {
  return commitMutation<StartNewMeetingMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      startNewMeetingTeamOnNext(res.startNewMeeting, {atmosphere, history})
      if (onCompleted) {
        onCompleted(res, errors)
      }
    }
  })
}

export default StartNewMeetingMutation
