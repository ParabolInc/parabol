import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useGenerateSuggestedGroupsMutation as TGenerateSuggestedGroupsMutation} from '../__generated__/useGenerateSuggestedGroupsMutation.graphql'
import type {useGenerateSuggestedGroupsMutation_meeting$data} from '../__generated__/useGenerateSuggestedGroupsMutation_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {SharedUpdater} from '../types/relayMutations'

graphql`
  fragment useGenerateSuggestedGroupsMutation_meeting on SuggestedGroupsSuccess {
    isUserInitiated
    meeting {
      id
      ...GroupingKanban_meeting
      suggestedGrouping {
        id
        mode
        userPrompt
        sameColumnOnly
        createdAt
        isStale
        groups {
          id
          title
          reflectionIds
        }
      }
    }
  }
`

const mutation = graphql`
  mutation useGenerateSuggestedGroupsMutation(
    $meetingId: ID!
    $mode: SuggestedGroupsMode!
    $userPrompt: String
    $sameColumnOnly: Boolean!
  ) {
    generateSuggestedGroups(
      meetingId: $meetingId
      mode: $mode
      userPrompt: $userPrompt
      sameColumnOnly: $sameColumnOnly
    ) {
      ...useGenerateSuggestedGroupsMutation_meeting @relay(mask: false)
    }
  }
`

/**
 * Marks suggestions a person asked for, so the board flashes them once. Suggestions the server
 * refreshed after a reflection changed carry isUserInitiated: false and are absorbed silently —
 * they arrive on every edit, and flashing each one would strobe the board mid-meeting.
 */
export const suggestedGroupsMeetingUpdater: SharedUpdater<
  useGenerateSuggestedGroupsMutation_meeting$data
> = (payload) => {
  if (!payload.getValue('isUserInitiated')) return
  const meeting = payload.getLinkedRecord('meeting')
  // Stamped with the suggestions' own createdAt rather than the arrival time, so remounting the
  // board does not re-flash a set the viewer has already been shown
  const createdAt = meeting?.getLinkedRecord('suggestedGrouping')?.getValue('createdAt')
  if (!createdAt) return
  meeting.setValue(createdAt, 'suggestedGroupingRevealAt')
}

const useGenerateSuggestedGroupsMutation = () => {
  const [commit, submitting] = useMutation<TGenerateSuggestedGroupsMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TGenerateSuggestedGroupsMutation>) => {
    // Wrapped rather than spread over, so a caller's onCompleted only ever sees a real success
    const {onCompleted, onError, ...rest} = config
    const showError = (message: string) => {
      atmosphere.eventEmitter.emit('addSnackbar', {
        message,
        autoDismiss: 5,
        key: 'generateSuggestedGroupsError'
      })
    }
    return commit({
      ...rest,
      updater: (store) => {
        const payload = store.getRootField('generateSuggestedGroups')
        if (!payload) return
        suggestedGroupsMeetingUpdater(payload, {atmosphere, store})
      },
      // The server throws for every failure mode (no embeddings yet, LLM unreachable, no AI
      // entitlement), and Atmosphere delivers a thrown GraphQLError here rather than to onError
      onCompleted: (res, errors) => {
        const error = errors?.[0]
        if (error) {
          showError(error.message)
          return
        }
        onCompleted?.(res, errors)
      },
      onError: (err) => {
        showError(err.message)
        onError?.(err)
      }
    })
  }
  return [execute, submitting] as const
}

export default useGenerateSuggestedGroupsMutation
