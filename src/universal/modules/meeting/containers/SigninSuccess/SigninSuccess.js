import React, {Component, PropTypes} from 'react';
import uuid from 'node-uuid';
import {connect} from 'react-redux';
import {push, replace} from 'react-router-redux';
import {cashay} from 'client/client';

const SIGNIN_ACTION_CREATE_TEAM_AND_MEETING = 'create_team_and_meeting';

const newTeamId = uuid.v4();
const newMeetingId = uuid.v4();

const graphQuery = `
  query($teamId: ID!) {
    team: getTeamById(teamId: $teamId) {
      id
    }
    meeting: getMeetingByTeamId(teamId: $teamId) {
      id,
      teamId
    }
  }`;

const mutationHandlers = {
  createTeam: (optimisticVariables, serverData) => {
    if (optimisticVariables) {
      return undefined;
    }
    return serverData;
  },
  createMeeting: (optimisticVariables, serverData) => {
    if (optimisticVariables) {
      return undefined;
    }
    return serverData;
  }
};

const cashayOpts = {
  component: 'SigninSuccess',
  mutationHandlers,
  variables: { teamId: newTeamId }
};

const mapStateToProps = () => ({
  meetingAndTeam: cashay.query(graphQuery, cashayOpts)
});
// @connectData(fetchData)
@connect(mapStateToProps)
export default class SigninSuccess extends Component {
  static propTypes = {
    meetingAndTeam: PropTypes.object,
    params: PropTypes.object,
    dispatch: PropTypes.func
  }

  componentWillMount() {
    this.signinStateMachine();
  }

  componentWillReceiveProps(nextProps) {
    this.signinStateMachine(nextProps);
  }

  signinStateMachine = (nextProps) => {
    const {dispatch, params, meetingAndTeam} = this.props;
    const {team, meeting} = meetingAndTeam;
    const {action} = params || {};
    switch (action) {
      case SIGNIN_ACTION_CREATE_TEAM_AND_MEETING:
        if (!team) {
          cashay.mutate('createTeam', { variables: {
            id: newTeamId,
            name: ''
          }});
        }
        if (!meeting && nextProps.meetingAndTeam.team.id) {
          cashay.mutate('createMeeting', { variables: {
            id: newMeetingId,
          }});
        }
        if (meeting.id) {
          dispatch(replace(`/meeting/${meeting.id}`));
        }
        break;
      default:
        dispatch(push('/404'));
    }
  }

  render() {
    return (
      <div>
        Engaging warp drive...
      </div>
    );
  }
}
