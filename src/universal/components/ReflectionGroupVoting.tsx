import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import styled from 'react-emotion'
import {ReflectionGroupVoting_meeting} from '__generated__/ReflectionGroupVoting_meeting.graphql'
import {ReflectionGroupVoting_reflectionGroup} from '__generated__/ReflectionGroupVoting_reflectionGroup.graphql'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import VoteForReflectionGroupMutation from 'universal/mutations/VoteForReflectionGroupMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import ui from 'universal/styles/ui'
import {meetingVoteIcon} from 'universal/styles/meeting'
import NewMeetingCheckInMutation from 'universal/mutations/NewMeetingCheckInMutation'
import appTheme from 'universal/styles/theme/appTheme'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'
import handleOnCompletedToastError from 'universal/mutations/handlers/handleOnCompletedToastError'

interface Props extends WithMutationProps, WithAtmosphereProps {
  isExpanded: boolean
  meeting: ReflectionGroupVoting_meeting
  reflectionGroup: ReflectionGroupVoting_reflectionGroup
}

const UpvoteRow = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

const UpvoteIcon = styled(Icon)(({color}: {color: string}) => ({
  color,
  cursor: 'pointer',
  fontSize: MD_ICONS_SIZE_18,
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

    const {
      meetingId,
      viewerMeetingMember: {isCheckedIn}
    } = meeting
    const {reflectionGroupId} = reflectionGroup
    submitMutation()
    const handleCompleted = (res, errors) => {
      onCompleted()
      const error = getGraphQLError(res, errors)
      error && handleOnCompletedToastError(error, atmosphere)
    }
    const sendVote = () =>
      VoteForReflectionGroupMutation(
        atmosphere,
        {reflectionGroupId},
        {meetingId},
        onError,
        handleCompleted
      )
    if (!isCheckedIn) {
      const {viewerId: userId} = atmosphere
      NewMeetingCheckInMutation(
        atmosphere,
        {meetingId, userId, isCheckedIn: true},
        {onError, onCompleted: sendVote}
      )
    } else {
      sendVote()
    }
  }

  unvote = () => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props
    const {meetingId} = meeting
    const {reflectionGroupId} = reflectionGroup
    const handleCompleted = (res, errors) => {
      onCompleted()
      const error = getGraphQLError(res, errors)
      error && handleOnCompletedToastError(error, atmosphere)
    }
    submitMutation()
    VoteForReflectionGroupMutation(
      atmosphere,
      {isUnvote: true, reflectionGroupId},
      {meetingId},
      onError,
      handleCompleted
    )
  }

  render () {
    const {meeting, reflectionGroup, isExpanded} = this.props
    const viewerVoteCount = reflectionGroup.viewerVoteCount || 0
    const {settings, viewerMeetingMember} = meeting
    const {maxVotesPerGroup} = settings
    const {votesRemaining} = viewerMeetingMember
    const upvotes = [...Array(viewerVoteCount).keys()]
    const canVote = viewerVoteCount < maxVotesPerGroup && votesRemaining > 0
    return (
      <UpvoteColumn>
        <UpvoteRow>
          {upvotes.map((idx) => (
            <UpvoteIcon key={idx} color={ui.palette.warm} onClick={this.unvote}>
              {meetingVoteIcon}
            </UpvoteIcon>
          ))}
          {canVote && (
            <UpvoteIcon
              color={isExpanded ? ui.palette.dark : appTheme.brand.primary.midGray}
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

export default createFragmentContainer(
  withMutationProps(withAtmosphere(ReflectionGroupVoting)),
  graphql`
    fragment ReflectionGroupVoting_meeting on RetrospectiveMeeting {
      meetingId: id
      viewerMeetingMember {
        isCheckedIn
        ... on RetrospectiveMeetingMember {
          votesRemaining
        }
      }
      settings {
        maxVotesPerGroup
        totalVotes
      }
    }

    fragment ReflectionGroupVoting_reflectionGroup on RetroReflectionGroup {
      reflectionGroupId: id
      viewerVoteCount
    }
  `
)
