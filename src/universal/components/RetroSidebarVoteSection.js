// @flow
import React from 'react';
import styled from 'react-emotion';
import type {RetroSidebarVoteSection_viewer as Viewer} from './__generated__/RetroSidebarVoteSection_viewer.graphql';
import {createFragmentContainer} from 'react-relay';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';

type Props = {
  viewer: Viewer
}

const SidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '3.75rem'
});

const Header = styled('div')({
  fontWeight: 'bold'
});

const CheckIcon = styled(StyledFontAwesome)(({isDark}) => ({
  color: 'pink',
  opacity: isDark ? 1 : 0.5
}));

const CheckMarkRow = styled('div')({
  display: 'flex'
});
const RetroSidebarVoteSection = (props: Props) => {
  const {viewer: {meetingMember: {myVotesRemaining}, team: {meetingSettings: {totalVotes}, newMeeting: {teamVotesRemaining}}}} = props;
  const checkMarks = new Array(totalVotes).fill(undefined).map((n, idx) => idx < myVotesRemaining);
  return (
    <SidebarPhaseItemChild>
      <Header>{'My Votes Remaining'}</Header>
      <CheckMarkRow>
        {checkMarks.map((isDark, idx) => <CheckIcon key={idx} name="check" isDark={isDark} />)}
      </CheckMarkRow>
      <Header>{'Team Votes Remaining'}</Header>
      {teamVotesRemaining}
    </SidebarPhaseItemChild>
  )
};

export default createFragmentContainer(
  RetroSidebarVoteSection,
  graphql`
    fragment RetroSidebarVoteSection_viewer on User {
      meetingMember(teamId: $teamId) {
        ... on RetrospectiveMeetingMember {
          myVotesRemaining: votesRemaining
        }
      }
      team(teamId: $teamId) {
        meetingSettings(meetingType: $meetingType) {
          ... on RetrospectiveMeetingSettings {
            totalVotes
          }
        }
        newMeeting {
          ... on RetrospectiveMeeting {
            teamVotesRemaining: votesRemaining
          }
        }
      }
    }
  `
);
