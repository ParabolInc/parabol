import shortid from 'shortid';
import getRethink from '../../../../database/rethinkDriver';
import {ACTIVE, FUTURE} from '../../../../../universal/utils/constants';
import convertToProjectContent from 'universal/utils/draftjs/convertToProjectContent';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';


const SEED_PROJECTS = [
  {
    status: ACTIVE,
    sortOrder: 0,
    content: convertToProjectContent(`
      Invite any missing team members to join the team. Tap on ‘Team Settings’
      in the dashboard header above.
    `)
  },
  {
    status: ACTIVE,
    sortOrder: 1,
    content: convertToProjectContent(`
      Try a test run of an Action Meeting. Tap on ‘Meeting Lobby’ in
      the dashboard header above. #private
    `)
  },
  {
    status: FUTURE,
    sortOrder: 0,
    content: convertToProjectContent(`
      Make good teaming a habit! Schedule a weekly Action Meeting with your
      team. Pro-tip: include a link to the meeting lobby.
    `)
  },
  {
    status: FUTURE,
    sortOrder: 1,
    content: convertToProjectContent(`
      Add integrations (like Slack, GitHub…) for your team.
      See the Integrations tab under Team Settings
    `)
  }
];

export default (userId, teamId) => {
  const r = getRethink();
  const now = new Date();

  const seedProjects = SEED_PROJECTS.map((proj) => ({
    ...proj,
    id: `${teamId}::${shortid.generate()}`,
    createdAt: now,
    createdBy: userId,
    tags: getTagsFromEntityMap(JSON.parse(proj.content).entityMap),
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
          updatedAt: change('new_val')('updatedAt')
        }))
      );
    });
};
