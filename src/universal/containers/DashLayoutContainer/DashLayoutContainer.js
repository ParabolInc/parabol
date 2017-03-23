import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import DashLayout from 'universal/components/Dashboard/DashLayout';
import {TEAM} from 'universal/subscriptions/constants';
import {TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';
import {setDashAlertPresence} from 'universal/modules/dashboard/ducks/dashDuck';

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
  trialNotification @cached(type: "Notification") {
    orgId
    type
  }
}
`;


const mapStateToProps = (state) => {
  const {trialNotification, teams} = cashay.query(dashNavListQuery, {
    // currently same as dashNavListContainer, could combine ops
    op: 'dashLayoutContainer',
    resolveCached: {
      teams: () => () => true,
      trialNotification: () => (doc) => (doc.type === TRIAL_EXPIRED || doc.type === TRIAL_EXPIRES_SOON) && doc.startAt < new Date()
    },
    sort: {
      teams: (a, b) => a.name > b.name ? 1 : -1
    }
  }).data;
  return {
    activeMeetings: resolveActiveMeetings(teams),
    tms: state.auth.obj.tms,
    userId: state.auth.sub,
    trialNotification,
    hasDashAlert: state.dash.hasDashAlert
  };
};

const maybeSetDashAlert = (props) => {
  const {
    activeMeetings,
    trialNotification,
    hasDashAlert,
    dispatch
  } = props;
  const shouldHaveDashAlert = activeMeetings.length > 0 || trialNotification.type;
  if (shouldHaveDashAlert !== hasDashAlert) {
    dispatch(setDashAlertPresence(shouldHaveDashAlert));
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
    tms: PropTypes.array,
    trialNotification: PropTypes.object
    // userId: PropTypes.string
  };

  componentWillMount() {
    maybeSetDashAlert(this.props);
  }

  componentDidMount() {
    const {tms} = this.props;
    subToAllTeams(tms);
    // cashay.subscribe(NOTIFICATIONS, userId)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tms !== nextProps.tms) {
      subToAllTeams(nextProps.tms);
    }
    maybeSetDashAlert(nextProps);
  }

  render() {
    const {activeMeetings, children, dispatch, trialNotification} = this.props;
    return (
      <DashLayout
        activeMeetings={activeMeetings}
        dispatch={dispatch}
        trialNotification={trialNotification}
      >
        {children}
      </DashLayout>
    );
  }
}
