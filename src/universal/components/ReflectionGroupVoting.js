// @flow
import * as React from 'react';
import {createFragmentContainer} from 'react-relay';
import styled from 'react-emotion';
import type {ReflectionGroupVoting_meeting as Meeting} from './__generated__/ReflectionGroupVoting_meeting.graphql';
import type {ReflectionGroupVoting_reflectionGroup as ReflectionGroup} from './__generated__/ReflectionGroupVoting_reflectionGroup.graphql';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import VoteForReflectionGroupMutation from 'universal/mutations/VoteForReflectionGroupMutation';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import ui from 'universal/styles/ui';
import StyledError from 'universal/components/StyledError';
import NewMeetingCheckInMutation from 'universal/mutations/NewMeetingCheckInMutation';

const {Component} = React;

type Props = {|
  atmosphere: Object,
  meeting: Meeting,
  reflectionGroup: ReflectionGroup,
  ...MutationProps
|};

const CheckMarkRow = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
});

const CheckIcon = styled(StyledFontAwesome)(({color}) => ({
  color,
  cursor: 'pointer',
  marginRight: '.25rem',
  width: ui.iconSize
}));

const CheckColumn = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: ui.votingCheckmarksWidth
});

class ReflectionGroupVoting extends Component<Props> {
  vote = () => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props;
    const {meetingId, viewerMeetingMember: {isCheckedIn}} = meeting;
    const {reflectionGroupId} = reflectionGroup;
    submitMutation();
    const sendVote = () => VoteForReflectionGroupMutation(atmosphere, {reflectionGroupId}, {meetingId}, onError, onCompleted);
    if (!isCheckedIn) {
      const {viewerId: userId} = atmosphere;
      NewMeetingCheckInMutation(atmosphere, {meetingId, userId, isCheckedIn: true}, onError, sendVote);
    } else {
      sendVote();
    }
  };

  unvote = () => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props;
    const {meetingId} = meeting;
    const {reflectionGroupId} = reflectionGroup;
    submitMutation();
    VoteForReflectionGroupMutation(atmosphere, {isUnvote: true, reflectionGroupId}, {meetingId}, onError, onCompleted);
  };

  render() {
    const {error, meeting, reflectionGroup} = this.props;
    const {viewerVoteCount = 0} = reflectionGroup;
    const {settings, viewerMeetingMember} = meeting;
    const {maxVotesPerGroup} = settings;
    const {votesRemaining} = viewerMeetingMember;
    const checkMarks = [...Array(viewerVoteCount).keys()];
    const canVote = viewerVoteCount < maxVotesPerGroup && votesRemaining > 0;
    return (
      <CheckColumn>
        <CheckMarkRow>
          {checkMarks.map((idx) => <CheckIcon key={idx} name="check" color={ui.palette.warm} onClick={this.unvote} />)}
          {canVote && <CheckIcon name="check" color={ui.palette.midGray} onClick={this.vote} />}
        </CheckMarkRow>
        {error && <StyledError>{error.message}</StyledError>}
      </CheckColumn>
    );
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
);
