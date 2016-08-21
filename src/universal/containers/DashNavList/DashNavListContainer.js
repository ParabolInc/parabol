import React, {PropTypes} from 'react';
import DashNavList from 'universal/components/DashNavList/DashNavList';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import {TEAM} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';

const teamSubString = subscriptions.find(sub => sub.channel === TEAM).string;

const resolveDashNavTeams = (tms) => {
  const teams = [];
  for (let i = 0; i < tms.length; i++) {
    const teamId = tms[i];
    const {id, name} = cashay.subscribe(teamSubString, subscriber, {
      op: 'teamSub',
      key: teamId,
      variables: {teamId},
      dep: 'dashNavTeams'
    }).data.team;
    teams[i] = {
      href: `/team/${id}`,
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

export default connect(mapStateToProps)(DashNavListContainer);
