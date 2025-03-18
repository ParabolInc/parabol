import graphql from 'babel-plugin-relay/macro'
import {useCallback} from 'react'
import {useMutation} from 'react-relay'
import {RecordSourceProxy} from 'relay-runtime'
import {useStartMeetingCheckInMutation} from '../__generated__/useStartMeetingCheckInMutation.graphql'
import {useStartMeetingRetrospectiveMutation} from '../__generated__/useStartMeetingRetrospectiveMutation.graphql'
import {useStartMeetingSprintPokerMutation} from '../__generated__/useStartMeetingSprintPokerMutation.graphql'
import {useStartMeetingTeamPromptMutation} from '../__generated__/useStartMeetingTeamPromptMutation.graphql'

graphql`
  fragment useStartMeeting_retrospective on StartRetrospectiveSuccess {
    meeting {
      id
    }
    team {
      ...ActiveMeetings_team
    }
  }
`

graphql`
  fragment useStartMeeting_checkIn on StartCheckInSuccess {
    meeting {
      id
    }
    team {
      ...ActiveMeetings_team
    }
  }
`

graphql`
  fragment useStartMeeting_sprintPoker on StartSprintPokerSuccess {
    meeting {
      id
    }
    team {
      ...ActiveMeetings_team
    }
  }
`

graphql`
  fragment useStartMeeting_teamPrompt on StartTeamPromptSuccess {
    meeting {
      id
    }
    team {
      ...ActiveMeetings_team
    }
  }
`

const useStartMeeting = () => {
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
      team?.invalidateRecord()
    }

    return new Promise((resolve, reject) => {
      const onError = (error: Error) => reject(error)

      switch (meetingType) {
        case 'retrospective':
          return startRetrospective({
            variables: {teamId, templateId},
            onError,
            updater,
            onCompleted: (data) => {
              if (data.startRetrospective?.error) {
                reject(data.startRetrospective.error.message)
              }
              resolve(data.startRetrospective?.meeting?.id)
            }
          })
        case 'action':
          return startCheckIn({
            variables: {teamId},
            onError,
            updater,
            onCompleted: (data) => {
              if (data.startCheckIn?.error) {
                reject(data.startCheckIn.error.message)
              }
              resolve(data.startCheckIn?.meeting?.id)
            }
          })
        case 'poker':
          return startSprintPoker({
            variables: {teamId, templateId},
            onError,
            updater,
            onCompleted: (data) => {
              if (data.startSprintPoker?.error) {
                reject(data.startSprintPoker.error.message)
              }
              resolve(data.startSprintPoker?.meeting?.id)
            }
          })
        case 'teamPrompt':
          return startTeamPrompt({
            variables: {teamId},
            onError,
            updater,
            onCompleted: (data) => {
              if (data.startTeamPrompt?.error) {
                reject(data.startTeamPrompt.error.message)
              }
              resolve(data.startTeamPrompt?.meeting?.id)
            }
          })
        default: {
          reject('Invalid meeting type')
          return null
        }
      }
    })
  }, [])

  return [
    startMeeting,
    {
      isLoading:
        startRetrospectiveLoading ||
        startCheckInLoading ||
        startSprintPokerLoading ||
        startTeamPromptLoading
    }
  ] as const
}

export default useStartMeeting
