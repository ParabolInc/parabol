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
import appTheme from 'universal/styles/theme/appTheme';
import StyledError from 'universal/components/StyledError';

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
  cursor: 'pointer'
}));

const CheckColumn = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center'
});

class ReflectionGroupVoting extends Component<Props> {
  vote = () => {
    const {atmosphere, meeting, onError, onCompleted, reflectionGroup, submitMutation} = this.props;
    const {meetingId} = meeting;
    const {reflectionGroupId} = reflectionGroup;
    submitMutation();
    VoteForReflectionGroupMutation(atmosphere, {reflectionGroupId}, {meetingId}, onError, onCompleted);
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
    const {viewerVoteCount} = reflectionGroup;
    const {settings, viewerMeetingMember} = meeting;
    const {maxVotesPerGroup} = settings;
    const {votesRemaining} = viewerMeetingMember;
    const checkMarks = [...Array(viewerVoteCount).keys()];
    const canVote = viewerVoteCount < maxVotesPerGroup && votesRemaining > 0;
    return (
      <CheckColumn>
        <CheckMarkRow>
          {checkMarks.map((idx) => <CheckIcon key={idx} name="check" color={appTheme.palette.warm} onClick={this.unvote} />)}
          {canVote && <CheckIcon name="check" color={appTheme.brand.primary.midGray} onClick={this.vote} />}
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
