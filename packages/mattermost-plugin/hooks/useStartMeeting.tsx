import graphql from 'babel-plugin-relay/macro'
import {useCallback, useState} from 'react'
import {useMutation} from 'react-relay'
import {RecordSourceProxy} from 'relay-runtime'
import {useStartMeetingCheckInMutation} from '../__generated__/useStartMeetingCheckInMutation.graphql'
import {useStartMeetingRetrospectiveMutation} from '../__generated__/useStartMeetingRetrospectiveMutation.graphql'
import {useStartMeetingSprintPokerMutation} from '../__generated__/useStartMeetingSprintPokerMutation.graphql'
import {useStartMeetingTeamPromptMutation} from '../__generated__/useStartMeetingTeamPromptMutation.graphql'
//import addNodeToArray from '../../client/utils/relay/addNodeToArray'

graphql`
  fragment useStartMeeting_retrospective on StartRetrospectiveSuccess {
    meeting {
      id
    }
  }
`

graphql`
  fragment useStartMeeting_checkIn on StartCheckInSuccess {
    meeting {
      id
    }
  }
`

graphql`
  fragment useStartMeeting_sprintPoker on StartSprintPokerSuccess {
    meeting {
      id
    }
  }
`

graphql`
  fragment useStartMeeting_teamPrompt on StartTeamPromptSuccess {
    meeting {
      id
    }
  }
`

const useStartMeeting = () => {
  const [error, setError] = useState<Error | null>(null)
  const [startRetrospective, startRetrospectiveLoading] =
    useMutation<useStartMeetingRetrospectiveMutation>(graphql`
      mutation useStartMeetingRetrospectiveMutation($teamId: ID!, $templateId: ID!) {
        selectTemplate(selectedTemplateId: $templateId, teamId: $teamId) {
          meetingSettings {
            id
          }
        }
        startRetrospective(teamId: $teamId) {
          ...useStartMeeting_retrospective @relay(mask: false)
          ... on ErrorPayload {
            error {
              message
            }
          }
        }
      }
    `)

  const [startCheckIn, startCheckInLoading] = useMutation<useStartMeetingCheckInMutation>(graphql`
    mutation useStartMeetingCheckInMutation($teamId: ID!) {
      startCheckIn(teamId: $teamId) {
        ...useStartMeeting_checkIn @relay(mask: false)
        ... on ErrorPayload {
          error {
            message
          }
        }
        ... on StartCheckInSuccess {
          meeting {
            id
          }
        }
      }
    }
  `)

  const [startSprintPoker, startSprintPokerLoading] =
    useMutation<useStartMeetingSprintPokerMutation>(graphql`
      mutation useStartMeetingSprintPokerMutation($teamId: ID!, $templateId: ID!) {
        selectTemplate(selectedTemplateId: $templateId, teamId: $teamId) {
          meetingSettings {
            id
          }
        }
        startSprintPoker(teamId: $teamId) {
          ...useStartMeeting_sprintPoker @relay(mask: false)
          ... on ErrorPayload {
            error {
              message
            }
          }
        }
      }
    `)

  const [startTeamPrompt, startTeamPromptLoading] = useMutation<useStartMeetingTeamPromptMutation>(
    graphql`
      mutation useStartMeetingTeamPromptMutation($teamId: ID!) {
        startTeamPrompt(teamId: $teamId) {
          ...useStartMeeting_teamPrompt @relay(mask: false)
          ... on ErrorPayload {
            error {
              message
            }
          }
        }
      }
    `
  )

  const startMeeting = useCallback((teamId: string, meetingType: string, templateId: string) => {
    const updater = (store: RecordSourceProxy) => {
      const team = store.get(teamId)
      if (!team) return
      //addNodeToArray(newNode, team, 'activeMeetings', 'id')

      team?.invalidateRecord()
    }
    setError(null)
    const onError = (error: Error) => setError(error)
    switch (meetingType) {
      case 'retrospective':
        return startRetrospective({variables: {teamId, templateId}, onError, updater})
      case 'action':
        return startCheckIn({variables: {teamId}, onError, updater})
      case 'poker':
        return startSprintPoker({variables: {teamId, templateId}, onError, updater})
      case 'teamPrompt':
        return startTeamPrompt({variables: {teamId}, onError, updater})
      default: {
        const error = new Error('Invalid meeting type')
        setError(error)
        return error
      }
    }
  }, [])

  return [
    startMeeting,
    {
      isLoading:
        startRetrospectiveLoading ||
        startCheckInLoading ||
        startSprintPokerLoading ||
        startTeamPromptLoading,
      isError: error
    }
  ] as const
}

export default useStartMeeting
