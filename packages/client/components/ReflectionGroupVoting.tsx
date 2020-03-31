import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {ReflectionGroupVoting_meeting} from '../__generated__/ReflectionGroupVoting_meeting.graphql'
import {ReflectionGroupVoting_reflectionGroup} from '../__generated__/ReflectionGroupVoting_reflectionGroup.graphql'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import VoteForReflectionGroupMutation from '../mutations/VoteForReflectionGroupMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import {meetingVoteIcon} from '../styles/meeting'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import Icon from './Icon'
import getGraphQLError from '../utils/relay/getGraphQLError'
import isTempId from '../utils/relay/isTempId'

interface Props extends WithMutationProps, WithAtmosphereProps {
  isExpanded: boolean
  meeting: ReflectionGroupVoting_meeting
  reflectionGroup: ReflectionGroupVoting_reflectionGroup
}

const UpvoteRow = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

const UpvoteIcon = styled(Icon)<{color: string}>(({color}) => ({
  color,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD18,
  height: 24,
  lineHeight: '24px',
  marginLeft: 8,
  textAlign: 'center',
  userSelect: 'none',
  width: 24
}))

const UpvoteColumn = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: 96
})

class ReflectionGroupVoting extends Component<Props> {
  vote = () => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props
    const {id: meetingId} = meeting
    const {id: reflectionGroupId} = reflectionGroup
    if (isTempId(reflectionGroupId)) return
    submitMutation()
    const handleCompleted = (res, errors) => {
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
    VoteForReflectionGroupMutation(
      atmosphere,
      {reflectionGroupId},
      {onError, onCompleted: handleCompleted, meetingId}
    )
  }

  unvote = () => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props
    const {id: meetingId, localStage} = meeting
    const {isComplete} = localStage!
    if (isComplete) return
    const {id: reflectionGroupId} = reflectionGroup
    const handleCompleted = (res, errors) => {
      onCompleted()
      const error = getGraphQLError(res, errors)
      if (error) {
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: 'unvoteError',
          message: typeof error === 'string' ? error : error.message,
          autoDismiss: 5
        })
      }
    }
    submitMutation()
    VoteForReflectionGroupMutation(
      atmosphere,
      {isUnvote: true, reflectionGroupId},
      {onError, onCompleted: handleCompleted, meetingId}
    )
  }

  render() {
    const {meeting, reflectionGroup, isExpanded} = this.props
    const viewerVoteCount = Math.max(0, reflectionGroup.viewerVoteCount || 0)
    const {localStage, settings, viewerMeetingMember} = meeting
    const {maxVotesPerGroup} = settings
    const {votesRemaining} = viewerMeetingMember
    const {isComplete} = localStage!
    const upvotes = [...Array(viewerVoteCount).keys()]
    const canVote = viewerVoteCount < maxVotesPerGroup && votesRemaining > 0 && !isComplete
    return (
      <UpvoteColumn>
        <UpvoteRow data-cy="reflection-vote-row">
          {upvotes.map((idx) => (
            <UpvoteIcon
              data-cy={`completed-vote-${idx}`}
              key={idx}
              color={isExpanded ? PALETTE.EMPHASIS_COOL_LIGHTER : PALETTE.EMPHASIS_COOL}
              onClick={this.unvote}
            >
              {meetingVoteIcon}
            </UpvoteIcon>
          ))}
          {canVote && (
            <UpvoteIcon
              data-cy={`add-vote`}
              color={isExpanded ? 'rgba(255, 255, 255, .65)' : PALETTE.TEXT_GRAY}
              onClick={this.vote}
            >
              {meetingVoteIcon}
            </UpvoteIcon>
          )}
        </UpvoteRow>
      </UpvoteColumn>
    )
  }
}

export default createFragmentContainer(withMutationProps(withAtmosphere(ReflectionGroupVoting)), {
  meeting: graphql`
    fragment ReflectionGroupVoting_meeting on RetrospectiveMeeting {
      localStage {
        isComplete
      }
      id
      viewerMeetingMember {
        votesRemaining
      }
      settings {
        maxVotesPerGroup
        totalVotes
      }
    }
  `,
  reflectionGroup: graphql`
    fragment ReflectionGroupVoting_reflectionGroup on RetroReflectionGroup {
      id
      viewerVoteCount
    }
  `
})
