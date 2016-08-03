import React, {Component, PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {reduxSocket} from 'redux-socket-cluster';
import subscriptions from 'universal/subscriptions/subscriptions';
import {PROJECTS, TEAM, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const teamMembersSubString = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;
const teamSubString = subscriptions.find(sub => sub.channel === TEAM).string;
const projectSubString = subscriptions.find(sub => sub.channel === PROJECTS).string;

// TODO memoize the map
const mapStateToProps = (state, props) => {
  const variables = {teamId: props.params.teamId};
  const memberSub = cashay.subscribe(teamMembersSubString, subscriber, {component: 'memberSub', variables});
  return {
    memberSub,
    projectSubs: memberSub.data.teamMembers.map((member) => {
      const teamMemberId = member.id;
      return cashay.subscribe(projectSubString, subscriber, {component: 'projectSub', key: teamMemberId, variables: {teamMemberId}})
    }),
    teamSub: cashay.subscribe(teamSubString, subscriber, {component: 'teamSub', variables}),
  };
};

@requireAuth
@reduxSocket({}, reduxSocketOptions)
@connect(mapStateToProps)
export default class TeamContainer extends Component {
  static propTypes = {
    params: PropTypes.shape({
      teamId: PropTypes.string.isRequired
    }),
    user: PropTypes.object,
    memberSub: PropTypes.object,
    teamSub: PropTypes.object
  };


  render() {
    const {memberSub, projectSubs, teamSub, user, ...otherProps} = this.props;
    const {team} = teamSub.data;
    const {teamMembers} = memberSub.data;
    console.log('project Subs', projectSubs);
    return <Team team={team} teamMembers={teamMembers} user={user} {...otherProps} />;
  }
};
