import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useAcceptSuggestedGroupsMutation as TAcceptSuggestedGroupsMutation} from '../__generated__/useAcceptSuggestedGroupsMutation.graphql'
import type {useAcceptSuggestedGroupsMutation_meeting$data} from '../__generated__/useAcceptSuggestedGroupsMutation_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {OnNextHandler} from '../types/relayMutations'
import getMutationError from '../utils/relay/getMutationError'

graphql`
  fragment useAcceptSuggestedGroupsMutation_meeting on AcceptSuggestedGroupsSuccess {
    acceptedCount
    meeting {
      id
      ...GroupingKanban_meeting
      resetReflectionGroups {
        groupTitle
      }
      reflectionGroups {
        id
        title
        titleIsUserDefined
        sortOrder
        reflections {
          id
          reflectionGroupId
          sortOrder
        }
      }
      facilitator {
        user {
          preferredName
        }
      }
    }
  }
`

const mutation = graphql`
  mutation useAcceptSuggestedGroupsMutation($meetingId: ID!) {
    acceptSuggestedGroups(meetingId: $meetingId) {
      ...useAcceptSuggestedGroupsMutation_meeting @relay(mask: false)
    }
  }
`

const groupsLabel = (count: number) => `${count} suggested group${count === 1 ? '' : 's'}`

export const acceptSuggestedGroupsMeetingOnNext: OnNextHandler<
  useAcceptSuggestedGroupsMutation_meeting$data
> = (payload, {atmosphere}) => {
  const {acceptedCount, meeting} = payload
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: 'acceptSuggestedGroups',
    message: `${meeting.facilitator.user.preferredName} formed ${groupsLabel(acceptedCount)}.`
  })
}

const useAcceptSuggestedGroupsMutation = () => {
  const [commit, submitting] = useMutation<TAcceptSuggestedGroupsMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (
    config: UseMutationConfig<TAcceptSuggestedGroupsMutation> & {onUndo: () => void}
  ) => {
    const {onCompleted, onError, onUndo, ...rest} = config
    const showError = (message: string) => {
      atmosphere.eventEmitter.emit('addSnackbar', {
        message,
        autoDismiss: 5,
        key: 'acceptSuggestedGroupsError'
      })
    }
    return commit({
      ...rest,
      onCompleted: (res, errors) => {
        const error = errors?.[0]
        if (error) {
          showError(error.message)
          return
        }
        atmosphere.eventEmitter.emit('addSnackbar', {
          autoDismiss: 10,
          key: 'acceptSuggestedGroups',
          message: `Formed ${groupsLabel(res.acceptSuggestedGroups.acceptedCount)}.`,
          action: {label: 'Undo', callback: onUndo}
        })
        onCompleted?.(res, errors)
      },
      onError: onError ?? ((err) => showError(getMutationError(err).message))
    })
  }
  return [execute, submitting] as const
}

export default useAcceptSuggestedGroupsMutation
