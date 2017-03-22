import React, {Component, PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import SummaryEmail from 'universal/modules/email/components/SummaryEmail/SummaryEmail';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import makeHref from 'universal/utils/makeHref';
import {maintainSocket} from 'redux-socket-cluster';

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
      actions {
        id
        content
        teamMemberId
      }
      projects {
        id
        content
        status
        teamMemberId
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
  const {params: {meetingId}} = props;
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
    },
  }).data;
  return {
    meeting
  };
};

@requireAuth
@connect(mapStateToProps)
@maintainSocket
export default class MeetingSummaryContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    meeting: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {params: {meetingId}} = this.props;
    const variables = {meetingId};
    cashay.mutate('summarizeMeeting', {variables});
  }

  render() {
    const {meeting} = this.props;
    if (!meeting.createdAt) {
      return <LoadingView />;
    }
    const {teamId} = meeting;
    const title = `Action Meeting #${meeting.meetingNumber} Summary for ${meeting.teamName}`;
    const meetingUrl = makeHref(`/meeting/${teamId}`);
    const teamDashUrl = `/team/${teamId}`;

    return (
      <div>
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
