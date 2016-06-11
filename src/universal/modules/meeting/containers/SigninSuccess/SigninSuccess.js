import React, {Component, PropTypes} from 'react';
import uuid from 'node-uuid';
import {connect} from 'react-redux';
import {push, replace} from 'react-router-redux';
import {cashay} from 'client/client';

const SIGNIN_ACTION_CREATE_TEAM_AND_MEETING = 'create_team_and_meeting';

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
      return null;
    }
    return serverData;
  },
  createMeeting: (optimisticVariables, serverData) => {
    if (optimisticVariables) {
      return null;
    }
    return serverData;
  }
};

const cashayOpts = {
  component: 'SigninSuccess',
  mutationHandlers,
  variables: { teamId: null }
};

const mapStateToProps = (state) => {
  cashayOpts.variables.teamId = state.teamId;
  return {
    meetingAndTeam: cashay.query(graphQuery, cashayOpts)
  };
};
// @connectData(fetchData)
@connect(mapStateToProps)
export default class SigninSuccess extends Component {
  static propTypes = {
    meetingAndTeam: PropTypes.object,
    params: PropTypes.object,
    dispatch: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      newTeamId: null,
      newMeetingId: null
    };
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
          const newTeamId = uuid.v4();
          this.setState({newTeamId});
          cashay.mutate('createTeam', { variables: {
            id: newTeamId,
            name: ''
          }});
        }
        if (team && !meeting &&
              nextProps && nextProps.meetingAndTeam.team.id) {
          const newMeetingId = uuid.v4();
          this.setState({newMeetingId});
          cashay.mutate('createMeeting', { variables: {
            id: newMeetingId
          }});
        }
        if (meeting && meeting.id) {
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
