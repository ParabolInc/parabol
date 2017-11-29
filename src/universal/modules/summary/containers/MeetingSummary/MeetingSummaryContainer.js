import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import SummaryEmail from 'universal/modules/email/components/SummaryEmail/SummaryEmail';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import makeHref from 'universal/utils/makeHref';
import {maintainSocket} from 'redux-socket-cluster';
import {MEETING_NAME, MEETING_SUMMARY_LABEL} from 'universal/utils/constants';
import ui from 'universal/styles/ui';

const meetingSummaryQuery = `
query{
  meeting: getMeetingById(id: $id) @cached(type: "Meeting") {
    createdAt
    id
    teamId
    teamName
    meetingNumber
    agendaItemsCompleted
    invitees {
      id
      present
      tasks {
        id
        content
        status
        teamMemberId
        tags
      }
      picture
      preferredName
    }
    successExpression
    successStatement
  }
}`;

const mutationHandlers = {
  summarizeMeeting(optimisticVariables, queryResponse, currentResponse) {
    if (queryResponse) {
      // TODO figure out why I can't use Object.assign. I think Chrome@latest creates a new object!
      currentResponse.meeting = queryResponse;
      currentResponse.meeting.createdAt = new Date(queryResponse.createdAt);
      return currentResponse;
    }
    return undefined;
  }
};

const mapStateToProps = (state, props) => {
  const {match: {params: {meetingId}}} = props;
  const {meeting} = cashay.query(meetingSummaryQuery, {
    op: 'meetingSummaryContainer',
    key: '',
    mutationHandlers,
    variables: {id: meetingId},
    resolveCached: {
      meeting: () => meetingId
    },
    sort: {
      invitees: (a, b) => a.preferredName > b.preferredName ? 1 : -1
    }
  }).data;
  return {
    meeting,
    meetingId
  };
};

@connect(mapStateToProps)
@maintainSocket
export default class MeetingSummaryContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    match: PropTypes.object.isRequired,
    meeting: PropTypes.object.isRequired,
    meetingId: PropTypes.string.isRequired
  };

  componentWillMount() {
    const {meetingId} = this.props;
    const variables = {meetingId};
    cashay.mutate('summarizeMeeting', {variables});
  }

  render() {
    const {meeting} = this.props;
    if (!meeting.createdAt) {
      return <LoadingView />;
    }
    const {teamId} = meeting;
    const title = `${MEETING_NAME} #${meeting.meetingNumber} ${MEETING_SUMMARY_LABEL} for ${meeting.teamName}`;
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
  }
}
