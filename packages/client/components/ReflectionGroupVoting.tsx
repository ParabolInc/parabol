import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import Atmosphere from '../Atmosphere'
import VoteForReflectionGroupMutation from '../mutations/VoteForReflectionGroupMutation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import getGraphQLError from '../utils/relay/getGraphQLError'
import isTempId from '../utils/relay/isTempId'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {ReflectionGroupVoting_meeting} from '../__generated__/ReflectionGroupVoting_meeting.graphql'
import {ReflectionGroupVoting_reflectionGroup} from '../__generated__/ReflectionGroupVoting_reflectionGroup.graphql'
import FlatButton from './FlatButton'
import Icon from './Icon'

interface Props extends WithMutationProps {
  isExpanded: boolean
  meeting: ReflectionGroupVoting_meeting
  reflectionGroup: ReflectionGroupVoting_reflectionGroup
}

const UpvoteRow = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
})

const ThumbUpIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  height: 24,
  lineHeight: '24px',
  textAlign: 'center',
  userSelect: 'none',
  width: 24
})

const UpvoteButton = styled(FlatButton)<{isExpanded: boolean; disabled: boolean}>(
  ({isExpanded, disabled}) => ({
    color: isExpanded ? '#fff' : PALETTE.SLATE_600,
    height: 24,
    lineHeight: '24px',
    padding: 0,
    width: 24,
    ':hover,:focus,:active': {
      backgroundColor: !disabled ? (isExpanded ? PALETTE.SLATE_500 : PALETTE.SLATE_200) : undefined,
      boxShadow: 'none'
    }
  })
)

const VoteCount = styled('span')<{voteCount: number; isExpanded: boolean}>(
  ({voteCount, isExpanded}) => ({
    color: isExpanded
      ? voteCount === 0
        ? PALETTE.SLATE_200
        : '#fff'
      : voteCount === 0
      ? PALETTE.SLATE_700
      : PALETTE.SKY_500,
    fontWeight: 600,
    padding: '0 4px',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none'
  })
)

const UpvoteColumn = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: 96
})

const makeHandleCompleted = (onCompleted: () => void, atmosphere: Atmosphere) => (res, errors) => {
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
  const {isExpanded, meeting, reflectionGroup} = props
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
    <UpvoteColumn>
      <UpvoteRow data-cy='reflection-vote-row'>
        <UpvoteButton
          aria-label={`Remove vote`}
          isExpanded={isExpanded}
          disabled={!canDownvote}
          color={isExpanded ? PALETTE.SKY_400 : PALETTE.SKY_500}
          onClick={downvote}
        >
          <Icon>remove</Icon>
        </UpvoteButton>
        <VoteCount
          isExpanded={isExpanded}
          voteCount={viewerVoteCount}
          data-cy={`completed-vote-count`}
        >
          <ThumbUpIcon>{'thumb_up'}</ThumbUpIcon>
          {viewerVoteCount}
        </VoteCount>
        <UpvoteButton
          aria-label={`Add vote`}
          isExpanded={isExpanded}
          disabled={!canUpvote}
          color={isExpanded ? 'rgba(255, 255, 255, .65)' : PALETTE.SLATE_600}
          onClick={vote}
        >
          <Icon>add</Icon>
        </UpvoteButton>
      </UpvoteRow>
    </UpvoteColumn>
  )
}

export default createFragmentContainer(withMutationProps(ReflectionGroupVoting), {
  meeting: graphql`
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
  reflectionGroup: graphql`
    fragment ReflectionGroupVoting_reflectionGroup on RetroReflectionGroup {
      id
      viewerVoteCount
    }
  `
})
