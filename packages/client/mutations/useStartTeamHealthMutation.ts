import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useStartTeamHealthMutation as TStartTeamHealthMutation} from '../__generated__/useStartTeamHealthMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import getMutationError from '../utils/relay/getMutationError'

graphql`
  fragment useStartTeamHealthMutation_success on StartTeamHealthSuccess {
    meetings {
      id
      teamId
      team {
        id
        isViewerOnTeam
      }
    }
    teams {
      ...MeetingsDashActiveMeetings @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useStartTeamHealthMutation(
    $teamIds: [ID!]!
    $templateId: ID!
    $name: String
    $rrule: RRule
    $gcalInput: CreateGcalEventInput
    $joinMeetingSeriesId: ID
  ) {
    startTeamHealth(
      teamIds: $teamIds
      templateId: $templateId
      name: $name
      rrule: $rrule
      gcalInput: $gcalInput
      joinMeetingSeriesId: $joinMeetingSeriesId
    ) {
      ...useStartTeamHealthMutation_success @relay(mask: false)
    }
  }
`

const useStartTeamHealthMutation = () => {
  const [commit, submitting] = useMutation<TStartTeamHealthMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TStartTeamHealthMutation>) => {
    const showError = (message: string) => {
      atmosphere.eventEmitter.emit('addSnackbar', {
        message,
        autoDismiss: 5,
        key: 'startTeamHealthError'
      })
    }
    return commit({
      onError: (error) => showError(getMutationError(error).message),
      ...config,
      onCompleted: (res, errors) => {
        const error = errors?.[0]
        if (error) {
          showError(error.message)
          return
        }
        config.onCompleted?.(res, errors)
      }
    })
  }
  return [execute, submitting] as const
}

export default useStartTeamHealthMutation
