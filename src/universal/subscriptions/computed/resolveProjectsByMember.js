import {PROJECTS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import makeProjectsByStatus from 'universal/utils/makeProjectsByStatus';
import subscriptions from 'universal/subscriptions/subscriptions';

const projectSubQuery = subscriptions.find(sub => sub.channel === PROJECTS).string;

export default function resolveProjectsByMember(teamMemberId) {
  if (!teamMemberId) return undefined;
  const {projects} = cashay.subscribe(projectSubQuery, subscriber, {
    key: teamMemberId,
    op: PROJECTS,
    variables: {teamMemberId},
    dep: 'currentMemberProjects'
  }).data;
  return makeProjectsByStatus(projects, 'teamSort');
}
