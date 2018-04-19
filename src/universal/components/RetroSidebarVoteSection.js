// @flow
import React from 'react';
import styled from 'react-emotion';
import type {RetroSidebarVoteSection_viewer as Viewer} from './__generated__/RetroSidebarVoteSection_viewer.graphql';
import {createFragmentContainer} from 'react-relay';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

type Props = {
  viewer: Viewer
}

const SidebarPhaseItemChild = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: '3.75rem',
  padding: '1rem 0'
});

const Label = styled('div')({
  color: ui.labelHeadingColor,
  fontSize: appTheme.typography.s2,
  fontWeight: 600,
  lineHeight: appTheme.typography.s5
});

const CheckIcon = styled(StyledFontAwesome)(({isDark}) => ({
  color: appTheme.palette.warm,
  opacity: isDark ? 1 : 0.2,
  marginRight: '.25rem',
  width: ui.iconSize
}));

const CheckMarkRow = styled('div')({
  display: 'flex',
  margin: '.5rem 0 1.5rem'
});

const TeamVotesLabel = styled('div')({
  color: ui.palette.warm,
  fontFamily: appTheme.typography.monospace,
  fontSize: '1rem',
  lineHeight: '1.5',
  margin: 0,
  padding: 0
});

const RetroSidebarVoteSection = (props: Props) => {
  const {viewer: {team: {meetingSettings: {totalVotes = 0}, newMeeting}}} = props;
  const {teamVotesRemaining = 0, viewerMeetingMember} = newMeeting || {};
  const {myVotesRemaining = 0} = viewerMeetingMember || {};
  const checkMarks = [...Array(totalVotes).keys()];
  return (
    <SidebarPhaseItemChild>
      <Label>{'My Votes Remaining'}</Label>
      <CheckMarkRow>
        {checkMarks.map((idx) => <CheckIcon key={idx} name="check" isDark={idx < myVotesRemaining} />)}
      </CheckMarkRow>
      <Label>{'Team Votes Remaining'}</Label>
      <TeamVotesLabel>{teamVotesRemaining}</TeamVotesLabel>
    </SidebarPhaseItemChild>
  );
};

export default createFragmentContainer(
  RetroSidebarVoteSection,
  graphql`
    fragment RetroSidebarVoteSection_viewer on User {
      team(teamId: $teamId) {
        meetingSettings(meetingType: $meetingType) {
          ... on RetrospectiveMeetingSettings {
            totalVotes
          }
        }
        newMeeting {
          ... on RetrospectiveMeeting {
            teamVotesRemaining: votesRemaining
            viewerMeetingMember {
              myVotesRemaining: votesRemaining
            }
          }
        }
      }
    }
  `
);
