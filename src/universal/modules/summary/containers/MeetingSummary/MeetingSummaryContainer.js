import React, {Component, PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import SummaryEmail from 'universal/modules/email/components/SummaryEmail/SummaryEmail';
import LoadingView from 'universal/components/LoadingView/LoadingView';

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
      // TODO do this in cashay
      Object.assign(currentResponse.meeting, queryResponse, {createdAt: new Date(queryResponse.createdAt)});
    }
    return currentResponse;
  }
};

const mapStateToProps = (state, props) => {
  const {params: {meetingId}} = props;
  const {meeting} = cashay.query(meetingSummaryQuery, {
    op: 'meetingSummaryContainer',
    key: meetingId,
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
export default class MeetingSummaryContainer extends Component {
  static propTypes = {
    meeting: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {params: {meetingId}} = this.props;
    const variables = {meetingId};
    cashay.mutate('summarizeMeeting', {variables})
  }

  render() {
    const {meeting} = this.props;
    if (!meeting.createdAt) {
      return <LoadingView/>
    }
    return (
      <SummaryEmail
        meeting={meeting}
        referrer="meeting"
      />
    );
  }
};
