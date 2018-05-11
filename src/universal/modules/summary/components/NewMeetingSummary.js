// @flow
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Helmet from 'react-helmet';
import ui from 'universal/styles/ui';
import makeHref from 'universal/utils/makeHref';
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups';
import NewMeetingSummaryEmail from 'universal/modules/email/components/SummaryEmail/NewMeetingSummaryEmail';
import type {NewMeetingSummary_viewer as Viewer} from './__generated__/NewMeetingSummary_viewer.graphql';
import {MEETING_SUMMARY_LABEL} from 'universal/utils/constants';

type Props = {|
  viewer: Viewer
|};

const NewMeetingSummary = (props: Props) => {
  const {viewer: {newMeeting}} = props;
  const {meetingNumber, meetingType, team: {id: teamId, name: teamName}} = newMeeting;
  const meetingLabel = meetingTypeToLabel[meetingType];
  const title = `${meetingLabel} Meeting ${MEETING_SUMMARY_LABEL} | ${teamName} ${meetingNumber}`;
  const meetingUrl = makeHref(`/meeting/${teamId}`);
  const teamDashUrl = `/team/${teamId}`;
  return (
    <div style={{backgroundColor: ui.emailBackgroundColor, minHeight: '100vh'}}>
      <Helmet title={title} />
      <NewMeetingSummaryEmail
        meeting={newMeeting}
        referrer="meeting"
        meetingUrl={meetingUrl}
        teamDashUrl={teamDashUrl}
      />
    </div>
  );
};

NewMeetingSummary.propTypes = {
  viewer: PropTypes.object.isRequired
};

// Grab everything we need here since SummaryEmail is shared by the server
export default createFragmentContainer(
  NewMeetingSummary,
  graphql`
    fragment NewMeetingSummary_viewer on User {
      newMeeting(meetingId: $meetingId) {
        id
        createdAt
        meetingMembers {
          id
          isCheckedIn
          user {
            picture
            preferredName
          }
          ... on RetrospectiveMeetingMember {
            tasks {
              id
              content
              status
              tags
            }
          }
        }
        meetingNumber
        meetingType
        team {
          id
          name
        }
        ... on RetrospectiveMeeting {
          reflectionGroups(sortBy: voteCount) {
            id
            title
            voteCount
            reflections {
              id
              content
              sortOrder
            }
          }
        }
      }
    }
  `
);
