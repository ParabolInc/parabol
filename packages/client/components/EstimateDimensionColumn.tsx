import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import type {EstimateDimensionColumn_meeting$key} from '../__generated__/EstimateDimensionColumn_meeting.graphql'
import type {EstimateDimensionColumn_stage$key} from '../__generated__/EstimateDimensionColumn_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useIsInitializing from '../hooks/useIsInitializing'
import useIsPokerVotingClosing from '../hooks/useIsPokerVotingClosing'
import PokerResetDimensionMutation from '../mutations/PokerResetDimensionMutation'
import SetPokerSpectateMutation from '../mutations/SetPokerSpectateMutation'
import DeckActivityAvatars from './DeckActivityAvatars'
import LinkButton from './LinkButton'
import PokerActiveVoting from './PokerActiveVoting'
import PokerDiscussVoting from './PokerDiscussVoting'

interface Props {
  stage: EstimateDimensionColumn_stage$key
  meeting: EstimateDimensionColumn_meeting$key
}

const EstimateDimensionColumn = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meeting: meetingRef, stage: stageRef} = props
  const stage = useFragment(
    graphql`
      fragment EstimateDimensionColumn_stage on EstimateStage {
        ...PokerActiveVoting_stage
        ...PokerDiscussVoting_stage
        ...DeckActivityAvatars_stage
        id
        isVoting
        dimensionRef {
          name
        }
      }
    `,
    stageRef
  )
  const meeting = useFragment(
    graphql`
      fragment EstimateDimensionColumn_meeting on PokerMeeting {
        ...PokerActiveVoting_meeting
        ...PokerDiscussVoting_meeting
        facilitatorUserId
        id
        endedAt
        viewerMeetingMember {
          isSpectating
        }
      }
    `,
    meetingRef
  )
  const {endedAt, facilitatorUserId, id: meetingId, viewerMeetingMember} = meeting
  const isSpectating = viewerMeetingMember?.isSpectating
  const isFacilitator = viewerId === facilitatorUserId
  const {id: stageId, dimensionRef} = stage
  const {name} = dimensionRef
  const {isVoting} = stage
  const {onError, onCompleted, submitMutation, error, submitting} = useMutationProps()
  const isClosing = useIsPokerVotingClosing(isVoting, stageId)
  const isInitialStageRender = useIsInitializing()
  const reset = () => {
    if (submitting) return
    submitMutation()
    PokerResetDimensionMutation(atmosphere, {meetingId, stageId}, {onError, onCompleted})
  }
  const setSpectating = (isSpectating: boolean) => () => {
    if (submitting) return
    submitMutation()
    SetPokerSpectateMutation(atmosphere, {meetingId, isSpectating}, {onError, onCompleted})
  }
  const showVoting = isVoting || isClosing
  return (
    <div className='flex h-full w-full flex-col overflow-auto'>
      <div className='flex items-center px-4 py-2'>
        <div className='mr-auto font-semibold text-base leading-6'>{name}</div>
        {error && (
          <div className='pr-4 font-semibold text-[12px] text-fg-error'>{error.message}</div>
        )}
        {!isVoting && isFacilitator && !endedAt && (
          <LinkButton className='font-semibold text-[12px]' onClick={reset} palette={'blue'}>
            {'Team Revote'}
          </LinkButton>
        )}
        {isVoting && !endedAt && isSpectating && (
          <LinkButton
            className='font-semibold text-[12px]'
            onClick={setSpectating(false)}
            palette={'blue'}
          >
            {'Let me vote!'}
          </LinkButton>
        )}
        {isVoting && !endedAt && !isSpectating && (
          <LinkButton
            className='font-semibold text-[12px]'
            onClick={setSpectating(true)}
            palette={'blue'}
          >
            {'I don’t vote'}
          </LinkButton>
        )}
      </div>
      <DeckActivityAvatars stage={stage} />
      {showVoting ? (
        <PokerActiveVoting
          meeting={meeting}
          stage={stage}
          isClosing={isClosing}
          isInitialStageRender={isInitialStageRender}
        />
      ) : (
        <PokerDiscussVoting
          meeting={meeting}
          stage={stage}
          isInitialStageRender={isInitialStageRender}
        />
      )}
    </div>
  )
}

export default EstimateDimensionColumn
