import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import styled from 'react-emotion'
import {ReflectionGroupVoting_meeting} from '__generated__/ReflectionGroupVoting_meeting.graphql'
import {ReflectionGroupVoting_reflectionGroup} from '__generated__/ReflectionGroupVoting_reflectionGroup.graphql'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import VoteForReflectionGroupMutation from 'universal/mutations/VoteForReflectionGroupMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import ui from 'universal/styles/ui'
import {meetingVoteIcon} from 'universal/styles/meeting'
import StyledError from 'universal/components/StyledError'
import NewMeetingCheckInMutation from 'universal/mutations/NewMeetingCheckInMutation'
import appTheme from 'universal/styles/theme/appTheme'

interface Props extends WithMutationProps, WithAtmosphereProps {
  isExpanded: boolean
  meeting: ReflectionGroupVoting_meeting
  reflectionGroup: ReflectionGroupVoting_reflectionGroup
}

const UpvoteRow = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

const UpvoteIcon = styled(StyledFontAwesome)(({color}: {color: string}) => ({
  color,
  cursor: 'pointer',
  marginRight: '.25rem',
  width: ui.iconSize
}))

const CheckColumn = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: ui.votingCheckmarksWidth
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
    const sendVote = () =>
      VoteForReflectionGroupMutation(
        atmosphere,
        {reflectionGroupId},
        {meetingId},
        onError,
        onCompleted
      )
    if (!isCheckedIn) {
      const {viewerId: userId} = atmosphere
      NewMeetingCheckInMutation(
        atmosphere,
        {meetingId, userId, isCheckedIn: true},
        onError,
        sendVote
      )
    } else {
      sendVote()
    }
  }

  unvote = () => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props
    const {meetingId} = meeting
    const {reflectionGroupId} = reflectionGroup
    submitMutation()
    VoteForReflectionGroupMutation(
      atmosphere,
      {isUnvote: true, reflectionGroupId},
      {meetingId},
      onError,
      onCompleted
    )
  }

  render () {
    const {error, meeting, reflectionGroup, isExpanded} = this.props
    const viewerVoteCount = reflectionGroup.viewerVoteCount || 0
    const {settings, viewerMeetingMember} = meeting
    const {maxVotesPerGroup} = settings
    const {votesRemaining} = viewerMeetingMember
    const upvotes = [...Array(viewerVoteCount).keys()]
    const canVote = viewerVoteCount < maxVotesPerGroup && votesRemaining > 0
    return (
      <CheckColumn>
        <UpvoteRow>
          {upvotes.map((idx) => (
            <UpvoteIcon
              key={idx}
              name={meetingVoteIcon}
              color={ui.palette.warm}
              onClick={this.unvote}
            />
          ))}
          {canVote && (
            <UpvoteIcon
              name={meetingVoteIcon}
              color={isExpanded ? ui.palette.dark : appTheme.brand.primary.midGray}
              onClick={this.vote}
            />
          )}
        </UpvoteRow>
        {error && <StyledError>{error}</StyledError>}
      </CheckColumn>
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
