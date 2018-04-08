import * as React from 'react';
import {createFragmentContainer} from 'react-relay';
import styled from 'react-emotion';
import type {ReflectionGroupVoting_meeting as Meeting} from './__generated__/ReflectionGroupVoting_meeting.graphql';
import type {ReflectionGroupVoting_reflectionGroup as ReflectionGroup} from './__generated__/ReflectionGroupVoting_reflectionGroup.graphql';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import VoteForReflectionGroupMutation from 'universal/mutations/VoteForReflectionGroupMutation';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';

const {Component} = React;

type Props = {
  atmosphere: Object,
  meeting: Meeting,
  reflectionGroup: ReflectionGroup,
  ...MutationProps
};

const CheckMarkRow = styled('div')({
  display: 'flex'
});

const CheckIcon = styled(StyledFontAwesome)(({color}) => ({
  color: color || 'pink'
}));

class ReflectionGroupVoting extends Component<Props> {
  vote = (e) => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props;
    const {meetingId, settings, viewerMeetingMember} = meeting;
    const {maxVotesPerGroup} = settings;
    const {votesRemaining} = viewerMeetingMember;
    const {reflectionGroupId, viewerVoteCount} = reflectionGroup;
    if (votesRemaining < 1) {
      // onError({message: 'You have no votes left to give'});
      return;
    }
    if (viewerVoteCount >= maxVotesPerGroup) {
      // onError({message: `You can only give ${maxVotesPerGroup} votes per theme`})
      return;
    }
    submitMutation();
    VoteForReflectionGroupMutation(atmosphere, {reflectionGroupId}, {meetingId}, onError, onCompleted);
  };

  unvote = (e) => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props;
    const {meetingId, settings, viewerMeetingMember} = meeting;
    const {totalVotes} = settings;
    const {votesRemaining} = viewerMeetingMember;
    const {reflectionGroupId, viewerVoteCount} = reflectionGroup;
    if (votesRemaining >= totalVotes) {
      return;
    }
    if (viewerVoteCount <= 0) {
      return;
    }
    submitMutation();
    VoteForReflectionGroupMutation(atmosphere, {isUnvote: true, reflectionGroupId}, {meetingId}, onError, onCompleted);
  };

  render() {
    const {reflectionGroup} = this.props;
    const {viewerVoteCount} = reflectionGroup;
    const checkMarks = new Array(viewerVoteCount).fill(true);
    console.log('viewerVo', viewerVoteCount, checkMarks)
    return (
      <React.Fragment>
        <CheckMarkRow>
          {checkMarks.map((_, idx) => <CheckIcon key={idx} name="check" color={'pink'} onClick={this.unvote} />)}
        </CheckMarkRow>
        <CheckIcon name="check" color={'gray'} onClick={this.vote} />
      </React.Fragment>
    );
  }
};

export default createFragmentContainer(
  withMutationProps(withAtmosphere(ReflectionGroupVoting)),
  graphql`
    fragment ReflectionGroupVoting_meeting on RetrospectiveMeeting {
      meetingId: id
      viewerMeetingMember {
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
