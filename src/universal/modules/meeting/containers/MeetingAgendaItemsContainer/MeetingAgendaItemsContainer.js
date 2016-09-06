import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaItems
  from 'universal/modules/meeting/components/MeetingAgendaItems/MeetingAgendaItems';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {resolveSortedAgenda} from 'universal/modules/teamDashboard/helpers/computedValues';
import subscriptions from 'universal/subscriptions/subscriptions';
import {ACTIONS_BY_TEAMMEMBER, PROJECTS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import makeOutcomesByAgendaItem from './makeOutcomesByAgendaItem';

const actionSubQuery = subscriptions.find(sub => sub.channel === ACTIONS_BY_TEAMMEMBER).string;
const projectSubQuery = subscriptions.find(sub => sub.channel === PROJECTS).string;

const resolveTeamActionsByAgendaItem = (teamMembers) => {
  const actionSubs = [];
  for (let i = 0; i < teamMembers.length; i++) {
    const {id: teamMemberId} = teamMembers[i];
    actionSubs[i] = cashay.subscribe(actionSubQuery, subscriber, {
      key: teamMemberId,
      op: ACTIONS_BY_TEAMMEMBER,
      variables: {teamMemberId},
      dep: 'actionsByAgendaItem'
    }).data.actionsByTeamMember;
  }
  const allActions = [].concat(...actionSubs);
  return allActions;
};

const resolveTeamProjectsByAgendaItem = (teamMembers) => {
  const projectSubs = [];
  for (let i = 0; i < teamMembers.length; i++) {
    const {id: teamMemberId} = teamMembers[i];
    projectSubs[i] = cashay.subscribe(projectSubQuery, subscriber, {
      key: teamMemberId,
      op: PROJECTS,
      variables: {teamMemberId},
      dep: 'projectsByAgendaItem'
    }).data.projects;
  }
  const allProjects = [].concat(...projectSubs);
  return allProjects;
};

const mapStateToProps = (state, props) => {
  const {team: {id: teamId}, members: teamMembers} = props;
  const agenda = cashay.computed('sortedAgenda', [teamId], resolveSortedAgenda);
  const actions = cashay.computed('actionsByAgendaItem',
    [teamMembers, agenda], resolveTeamActionsByAgendaItem);
  const projects = cashay.computed('projectsByAgendaItem',
    [teamMembers, agenda], resolveTeamProjectsByAgendaItem);
  const outcomesByAgendaItem = makeOutcomesByAgendaItem(actions, projects, agenda, 'createdAt');
  return {
    agenda,
    outcomesByAgendaItem
  };
};

const MeetingAgendaItemsContainer = (props) => {
  // TODO: handle when there are no agenda items? Or, perhaps first call
  //       just skips to last call...
  if (!props.agenda || props.agenda.length < 1) {
    return <LoadingView />;
  }
  return <MeetingAgendaItems {...props}/>;
};

MeetingAgendaItemsContainer.propTypes = {
  agenda: PropTypes.array.isRequired,
  outcomesByAgendaItem: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(MeetingAgendaItemsContainer);
