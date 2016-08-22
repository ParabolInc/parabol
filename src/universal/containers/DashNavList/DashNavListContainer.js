import React, {PropTypes} from 'react';
import DashNavList from 'universal/components/DashNavList/DashNavList';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import {TEAM} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';

const teamSubQuery = subscriptions.find(sub => sub.channel === TEAM).string;

const resolveDashNavTeams = (tms) => {
  const teams = [];
  for (let i = 0; i < tms.length; i++) {
    const teamId = tms[i];
    const {name} = cashay.subscribe(teamSubQuery, subscriber, {
      op: TEAM,
      key: teamId,
      variables: {teamId},
      dep: 'dashNavTeams'
    }).data.team;
    teams[i] = {
      href: `/team/${teamId}`,
      label: name
    };
  }
  return teams;
};

const mapStateToProps = (state) => {
  return {
    teams: cashay.computed('dashNavTeams', [state.auth.obj.tms], resolveDashNavTeams)
  };
};

const DashNavListContainer = (props) => {
  const {teams} = props;
  return <DashNavList teams={teams}/>;
};

DashNavListContainer.propTypes = {
  teams: PropTypes.array
};

// needs to be false since this is the last container before we use Link to detect an active route
export default connect(mapStateToProps, undefined, undefined, {pure: false})(DashNavListContainer);
