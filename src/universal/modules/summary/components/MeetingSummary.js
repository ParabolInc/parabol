import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import SummaryEmail from 'universal/modules/email/components/SummaryEmail/SummaryEmail';
import ui from 'universal/styles/ui';
import {MEETING_NAME, MEETING_SUMMARY_LABEL} from 'universal/utils/constants';
import makeHref from 'universal/utils/makeHref';


const MeetingSummary = (props) => {
  const {viewer: {meeting}} = props;
  const {meetingNumber, teamId, teamName} = meeting;
  const title = `${MEETING_NAME} #${meetingNumber} ${MEETING_SUMMARY_LABEL} for ${teamName}`;
  const meetingUrl = makeHref(`/meeting/${teamId}`);
  const teamDashUrl = `/team/${teamId}`;
  return (
    <div style={{backgroundColor: ui.emailBackgroundColor, minHeight: '100vh'}}>
      <Helmet title={title} />
      <SummaryEmail
        meeting={meeting}
        referrer="meeting"
        meetingUrl={meetingUrl}
        teamDashUrl={teamDashUrl}
      />
    </div>
  );
};

MeetingSummary.propTypes = {
  viewer: PropTypes.object.isRequired
};

// Grab everything we need here since SummaryEmail is shared by the server
export default createFragmentContainer(
  MeetingSummary,
  graphql`
    fragment MeetingSummary_viewer on User {
      meeting(meetingId: $meetingId) {
        createdAt
        id
        teamId
        teamName
        meetingNumber
        agendaItemsCompleted
        invitees {
          id
          present
          projects {
            id
            content
            status
            assigneeId
            tags
          }
          picture
          preferredName
        }
        successExpression
        successStatement
      }
    }
  `
);
