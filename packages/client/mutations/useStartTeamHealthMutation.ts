import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useStartTeamHealthMutation as TStartTeamHealthMutation} from '../__generated__/useStartTeamHealthMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

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
  ) {
    startTeamHealth(
      teamIds: $teamIds
      templateId: $templateId
      name: $name
      rrule: $rrule
      gcalInput: $gcalInput
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
      ...config,
      // The server throws for every failure mode (cross-org series, locked team, nothing to
      // start), and Atmosphere delivers a thrown GraphQLError here rather than to onError
      onCompleted: (res, errors) => {
        const error = errors?.[0]
        if (error) {
          showError(error.message)
          return
        }
        config.onCompleted?.(res, errors)
      },
      onError: (error) => {
        showError(error.message)
        config.onError?.(error)
      }
    })
  }
  return [execute, submitting] as const
}

export default useStartTeamHealthMutation
