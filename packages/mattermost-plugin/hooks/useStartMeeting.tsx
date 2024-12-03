import graphql from 'babel-plugin-relay/macro'
import {useCallback, useState} from 'react'
import {useMutation} from "react-relay"
import {RecordSourceProxy} from 'relay-runtime'
import {useStartMeetingRetrospectiveMutation} from '../__generated__/useStartMeetingRetrospectiveMutation.graphql'
import {useStartMeetingCheckInMutation} from '../__generated__/useStartMeetingCheckInMutation.graphql'
import {useStartMeetingSprintPokerMutation} from '../__generated__/useStartMeetingSprintPokerMutation.graphql'
import {useStartMeetingTeamPromptMutation} from '../__generated__/useStartMeetingTeamPromptMutation.graphql'

const useStartMeeting = () => {
  const [error, setError] = useState<Error | null>(null)
  const [startRetrospective, startRetrospectiveLoading] = useMutation<useStartMeetingRetrospectiveMutation>(graphql`
    mutation useStartMeetingRetrospectiveMutation($teamId: ID!, $templateId: ID!) {
      selectTemplate(selectedTemplateId: $templateId, teamId: $teamId) {
        meetingSettings {
          id
        }
      }
      startRetrospective(teamId: $teamId) {
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

  const [startSprintPoker, startSprintPokerLoading] = useMutation<useStartMeetingSprintPokerMutation>(graphql`
    mutation useStartMeetingSprintPokerMutation($teamId: ID!, $templateId: ID!) {
      selectTemplate(selectedTemplateId: $templateId, teamId: $teamId) {
        meetingSettings {
          id
        }
      }
      startSprintPoker(teamId: $teamId) {
        ... on ErrorPayload {
          error {
            message
          }
        }
        ... on StartSprintPokerSuccess {
          meeting {
            id
          }
        }
      }
    }
  `)

  const [startTeamPrompt, startTeamPromptLoading] = useMutation<useStartMeetingTeamPromptMutation>(graphql`
    mutation useStartMeetingTeamPromptMutation($teamId: ID!) {
      startTeamPrompt(teamId: $teamId) {
        ... on ErrorPayload {
          error {
            message
          }
        }
        ... on StartTeamPromptSuccess {
          meeting {
            id
          }
        }
      }
    }
  `)

  const startMeeting = useCallback((teamId: string, meetingType: string, templateId: string) => {
    const updater = (store: RecordSourceProxy) => {
      const team = store.get(teamId)
      if (!team) return
      addNodeToArray(newNode, team, 'activeMeetings', 'id')

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

  return [startMeeting, {isLoading: startRetrospectiveLoading || startCheckInLoading || startSprintPokerLoading || startTeamPromptLoading, isError: error}] as const
}

export default useStartMeeting
