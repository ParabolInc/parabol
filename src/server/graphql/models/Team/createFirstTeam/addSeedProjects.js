import shortid from 'shortid';
import getRethink from '../../../../database/rethinkDriver';
import {ACTIVE, FUTURE} from '../../../../../universal/utils/constants';

const SEED_PROJECTS = [
  {
    status: ACTIVE,
    sortOrder: 0,
    content: `
      Invite any missing team members to join the team. Tap on ‘Team Settings’
      in the dashboard header above.
    `.split(/\s/).filter((s) => s.length).join(' ')
  },
  {
    status: ACTIVE,
    sortOrder: 1,
    content: `
      Try a test run of an Action meeting. Tap on ‘Meeting Lobby’ in
      the dashboard header above.
    `.split(/\s/).filter((s) => s.length).join(' ')
  },
  {
    status: FUTURE,
    sortOrder: 0,
    content: `
      Make good teaming a habit! Schedule a weekly Action meeting with your
      team. Pro-tip: include a link to the meeting lobby.
    `.split(/\s/).filter((s) => s.length).join(' ')
  }
];

export default (userId, teamId) => {
  const r = getRethink();
  const now = new Date();

  const seedProjects = SEED_PROJECTS.map((proj) => ({
    ...proj,
    id: `${teamId}::${shortid.generate()}`,
    isArchived: false,
    createdAt: now,
    createdBy: userId,
    teamId,
    teamMemberId: `${userId}::${teamId}`,
    userId,
    updatedAt: now
  }));

  return r.table('Project').insert(seedProjects, {returnChanges: true})
    .do((result) => {
      return r.table('ProjectHistory').insert(
        result('changes').map((change) => ({
          id: shortid.generate(),
          content: change('new_val')('content'),
          projectId: change('new_val')('id'),
          status: change('new_val')('status'),
          teamMemberId: change('new_val')('teamMemberId'),
          updatedAt: change('new_val')('updatedAt'),
        }))
      );
    })
    .run();
};
