// @flow
import React from 'react';
import styled from 'react-emotion';
import type {RetroSidebarVoteSection_viewer as Viewer} from './__generated__/RetroSidebarVoteSection_viewer.graphql';
import {createFragmentContainer} from 'react-relay';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import appTheme from 'universal/styles/theme/appTheme';

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
  color: appTheme.palette.warm,
  opacity: isDark ? 1 : 0.5
}));

const CheckMarkRow = styled('div')({
  display: 'flex'
});
const RetroSidebarVoteSection = (props: Props) => {
  const {viewer: {meetingMember, team: {meetingSettings: {totalVotes = 0}, newMeeting}}} = props;
  const {teamVotesRemaining = 0} = newMeeting || {};
  const {myVotesRemaining = 0} = meetingMember || {};
  const checkMarks = [...Array(totalVotes).keys()];
  return (
    <SidebarPhaseItemChild>
      <Header>{'My Votes Remaining'}</Header>
      <CheckMarkRow>
        {checkMarks.map((idx) => <CheckIcon key={idx} name="check" isDark={idx < myVotesRemaining} />)}
      </CheckMarkRow>
      <Header>{'Team Votes Remaining'}</Header>
      {teamVotesRemaining}
    </SidebarPhaseItemChild>
  );
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
