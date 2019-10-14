import {StartNewMeetingMutation as TStartNewMeetingMutation} from '../__generated__/StartNewMeetingMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'
import {IStartNewMeetingOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import updateLocalStage from '../utils/relay/updateLocalStage'

graphql`
  fragment StartNewMeetingMutation_team on StartNewMeetingPayload {
    ...StartNewMeetingMutationOnNext @relay(mask: false)
    team {
      ...ActionMeetingTeam @relay(mask: false)
      ...RetroMeetingTeam @relay(mask: false)
      newMeeting {
        phases {
          ...NewMeetingAvatarGroupPhases @relay(mask: false)
        }
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
    team: {
      newMeeting: {
        id: meetingId,
        phases: [firstPhase]
      }
    }
  } = payload
  updateLocalStage(atmosphere, meetingId, firstPhase.stages[0].id)
}

const StartNewMeetingMutation = (
  atmosphere: Atmosphere,
  variables: IStartNewMeetingOnMutationArguments,
  {history, onError, onCompleted}: LocalHandlers
) => {
  return commitMutation<TStartNewMeetingMutation>(atmosphere, {
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
