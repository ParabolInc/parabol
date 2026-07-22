import {Add as AddIcon, Remove as RemoveIcon, ThumbUp} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import type {ReflectionGroupVoting_meeting$key} from '../__generated__/ReflectionGroupVoting_meeting.graphql'
import type {ReflectionGroupVoting_reflectionGroup$key} from '../__generated__/ReflectionGroupVoting_reflectionGroup.graphql'
import type Atmosphere from '../Atmosphere'
import VoteForReflectionGroupMutation from '../mutations/VoteForReflectionGroupMutation'
import type {CompletedHandler} from '../types/relayMutations'
import {cn} from '../ui/cn'
import getGraphQLError from '../utils/relay/getGraphQLError'
import isTempId from '../utils/relay/isTempId'
import FlatButton from './FlatButton'

interface Props {
  isExpanded: boolean
  meeting: ReflectionGroupVoting_meeting$key
  reflectionGroup: ReflectionGroupVoting_reflectionGroup$key
}

const upvoteButtonClass =
  'h-6 w-6 p-0 leading-6 hover:shadow-none focus:shadow-none active:shadow-none'

const getUpvoteButtonHoverClass = (isExpanded: boolean, disabled: boolean) =>
  !disabled &&
  (isExpanded
    ? // sits on the dark expanded-stack scrim — invariant
      'hover:bg-slate-500 focus:bg-slate-500 active:bg-slate-500'
    : 'hover:bg-surface-hover focus:bg-surface-hover active:bg-surface-hover')

const makeHandleCompleted =
  (onCompleted: () => void, atmosphere: Atmosphere): CompletedHandler =>
  (res, errors) => {
    onCompleted()
    const error = getGraphQLError(res, errors)
    if (error) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'voteError',
        message: error.message || 'Error submitting vote',
        autoDismiss: 5
      })
    }
  }

const ReflectionGroupVoting = (props: Props) => {
  const {isExpanded, meeting: meetingRef, reflectionGroup: reflectionGroupRef} = props
  const meeting = useFragment(
    graphql`
      fragment ReflectionGroupVoting_meeting on RetrospectiveMeeting {
        localStage {
          isComplete
        }
        id
        viewerMeetingMember {
          votesRemaining
        }
        maxVotesPerGroup
      }
    `,
    meetingRef
  )
  const reflectionGroup = useFragment(
    graphql`
      fragment ReflectionGroupVoting_reflectionGroup on RetroReflectionGroup {
        id
        viewerVoteCount
      }
    `,
    reflectionGroupRef
  )
  const {id: reflectionGroupId} = reflectionGroup
  const {id: meetingId, localStage, maxVotesPerGroup, viewerMeetingMember} = meeting
  const {isComplete} = localStage!
  const votesRemaining = viewerMeetingMember?.votesRemaining ?? 0
  const viewerVoteCount = Math.max(0, reflectionGroup.viewerVoteCount || 0)
  const canUpvote = viewerVoteCount < maxVotesPerGroup && votesRemaining > 0 && !isComplete
  const canDownvote = viewerVoteCount > 0 && !isComplete

  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation} = useMutationProps()
  const vote = () => {
    if (isComplete || isTempId(reflectionGroupId) || !canUpvote) return
    submitMutation()
    const handleCompleted = makeHandleCompleted(onCompleted, atmosphere)
    VoteForReflectionGroupMutation(
      atmosphere,
      {reflectionGroupId},
      {onError, onCompleted: handleCompleted, meetingId}
    )
  }
  const downvote = () => {
    if (isComplete || isTempId(reflectionGroupId) || !canDownvote) return
    submitMutation()
    const handleCompleted = makeHandleCompleted(onCompleted, atmosphere)
    VoteForReflectionGroupMutation(
      atmosphere,
      {isUnvote: true, reflectionGroupId},
      {onError, onCompleted: handleCompleted, meetingId}
    )
  }

  return (
    <div className='flex w-24 flex-col justify-center'>
      <div className='flex items-center justify-end' data-cy='reflection-vote-row'>
        <FlatButton
          aria-label={`Remove vote`}
          disabled={!canDownvote}
          className={cn(
            upvoteButtonClass,
            isExpanded ? 'text-sky-400' : 'text-accent',
            getUpvoteButtonHoverClass(isExpanded, !canDownvote)
          )}
          onClick={downvote}
        >
          <RemoveIcon />
        </FlatButton>
        <span
          className={cn(
            'flex select-none items-center px-1 font-semibold',
            isExpanded
              ? viewerVoteCount === 0
                ? 'text-slate-200'
                : 'text-white'
              : viewerVoteCount === 0
                ? 'text-fg-primary'
                : 'text-accent'
          )}
        >
          <div className='flex h-6 w-6 select-none items-center justify-center'>
            <ThumbUp className='h-4.5 w-4.5' />
          </div>
          <span data-cy={`completed-vote-count`}>{viewerVoteCount}</span>
        </span>
        <FlatButton
          aria-label={`Add vote`}
          disabled={!canUpvote}
          className={cn(
            upvoteButtonClass,
            isExpanded ? 'text-white/65' : 'text-fg-secondary',
            getUpvoteButtonHoverClass(isExpanded, !canUpvote)
          )}
          onClick={vote}
        >
          <AddIcon />
        </FlatButton>
      </div>
    </div>
  )
}

export default ReflectionGroupVoting
