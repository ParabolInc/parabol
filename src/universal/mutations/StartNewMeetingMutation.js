import {commitMutation} from 'react-relay'
import handleMutationError from 'universal/mutations/handlers/handleMutationError'
import updateLocalStage from 'universal/utils/relay/updateLocalStage'

graphql`
  fragment StartNewMeetingMutation_team on StartNewMeetingPayload {
    error {
      title
      message
    }
    team {
      id
      meetingId
      newMeeting {
        ...CompleteNewMeetingFrag @relay(mask: false)
      }
      organization {
        retroMeetingsRemaining
      }
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

const StartNewMeetingMutation = (atmosphere, variables, {history}, onError, onCompleted) => {
  return commitMutation(atmosphere, {
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
