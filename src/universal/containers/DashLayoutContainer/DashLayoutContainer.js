import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import DashLayout from 'universal/components/Dashboard/DashLayout';
import {setMeetingAlertState} from 'universal/modules/dashboard/ducks/dashDuck';
import {TEAM} from 'universal/subscriptions/constants';

const resolveActiveMeetings = (teams) => {
  if (teams !== resolveActiveMeetings.teams) {
    resolveActiveMeetings.teams = teams;
    resolveActiveMeetings.cache = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if (team.meetingId) {
        resolveActiveMeetings.cache.push({
          link: `/meeting/${team.id}`,
          name: team.name
        });
      }
    }
  }
  return resolveActiveMeetings.cache;
};

const dashNavListQuery = `
query {
  teams @cached(type: "[Team]") {
    id
    name
    meetingId
  }
}
`;

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const {teams} = cashay.query(dashNavListQuery, {
    op: 'dashLayoutContainer',
    variables: {userId},
    resolveCached: {
      teams: () => () => true
    },
    sort: {
      teams: (a, b) => a.name > b.name ? 1 : -1
    }
  }).data;
  return {
    activeMeetings: resolveActiveMeetings(teams),
    tms: state.auth.obj.tms,
    userId: state.auth.sub,
    hasMeetingAlert: state.dash.hasMeetingAlert
  };
};

const maybeSetDashAlert = (props) => {
  const {
    activeMeetings,
    hasMeetingAlert,
    dispatch
  } = props;
  const shouldHaveMeetingAlert = activeMeetings.length > 0;
  if (shouldHaveMeetingAlert !== hasMeetingAlert) {
    dispatch(setMeetingAlertState(shouldHaveMeetingAlert));
  }
};

const subToAllTeams = (tms) => {
  for (let i = 0; i < tms.length; i++) {
    const teamId = tms[i];
    cashay.subscribe(TEAM, teamId);
  }
};

@connect(mapStateToProps)
export default class DashLayoutContainer extends Component {
  static propTypes = {
    activeMeetings: PropTypes.array,
    children: PropTypes.any,
    dispatch: PropTypes.func.isRequired,
    tms: PropTypes.array
    // userId: PropTypes.string
  };

  componentWillMount() {
    maybeSetDashAlert(this.props);
  }

  componentDidMount() {
    const {tms} = this.props;
    subToAllTeams(tms);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tms !== nextProps.tms) {
      subToAllTeams(nextProps.tms);
    }
    maybeSetDashAlert(nextProps);
  }

  render() {
    const {activeMeetings, children} = this.props;
    return (
      <DashLayout activeMeetings={activeMeetings}>
        {children}
      </DashLayout>
    );
  }
}
