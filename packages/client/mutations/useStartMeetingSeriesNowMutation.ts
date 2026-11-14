import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useStartMeetingSeriesNowMutation as TStartMeetingSeriesNowMutation} from '../__generated__/useStartMeetingSeriesNowMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import getMutationError from '../utils/relay/getMutationError'

const mutation = graphql`
  mutation useStartMeetingSeriesNowMutation($meetingSeriesId: ID!) {
    startMeetingSeriesNow(meetingSeriesId: $meetingSeriesId) {
      meeting {
        id
      }
      team {
        ...MeetingsDashActiveMeetings @relay(mask: false)
      }
    }
  }
`

const useStartMeetingSeriesNowMutation = () => {
  const [commit, submitting] = useMutation<TStartMeetingSeriesNowMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TStartMeetingSeriesNowMutation>) => {
    const showError = (message: string) => {
      atmosphere.eventEmitter.emit('addSnackbar', {
        message,
        autoDismiss: 5,
        key: 'startMeetingSeriesNowError'
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

export default useStartMeetingSeriesNowMutation
