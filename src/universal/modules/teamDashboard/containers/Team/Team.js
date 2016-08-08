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

const makeProjectSubs = (teamMembers) => {
  const projectSubs = [];
  for (let i = 0; i < teamMembers.length; i++) {
    const teamMemberId = teamMembers[i].id;
    projectSubs[i] = cashay.subscribe(projectSubString, subscriber, {
      op: 'projectSub',
      key: teamMemberId,
      variables: {teamMemberId}
    });
  }
  return projectSubs;
};
// TODO memoize the map
const mapStateToProps = (state, props) => {
  const variables = {teamId: props.params.teamId};
  const memberSub = cashay.subscribe(teamMembersSubString, subscriber, {op: 'memberSub', variables});
  const projectSubs = makeProjectSubs(memberSub.data.teamMembers);
  return {
    memberSub,
    projectSubs,
    teamSub: cashay.subscribe(teamSubString, subscriber, {op: 'teamSub', variables}),
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
    const {memberSub, teamSub, user, projectSubs, ...otherProps} = this.props;
    const {team} = teamSub.data;
    const {teamMembers} = memberSub.data;
    console.log('SUB', projectSubs)
    const projects = [].concat(...projectSubs.map(sub => sub.data.projects));
    console.log('project Subs', projects);
    return <Team team={team} teamMembers={teamMembers} user={user} {...otherProps} />;
  }
};
