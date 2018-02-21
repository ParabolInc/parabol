import shortid from 'shortid';
import getRethink from 'server/database/rethinkDriver';
import {ACTIVE, FUTURE} from 'server/../universal/utils/constants';
import convertToTaskContent from 'universal/utils/draftjs/convertToTaskContent';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';


const SEED_TASKS = [
  {
    status: ACTIVE,
    sortOrder: 0,
    content: convertToTaskContent(`
      Invite any missing team members to join the team. Tap on ‘Team Settings’
      in the dashboard header above.
    `)
  },
  {
    status: ACTIVE,
    sortOrder: 1,
    content: convertToTaskContent(`
      Try a test run of an Action Meeting. Tap on ‘Meeting Lobby’ in
      the dashboard header above. #private
    `)
  },
  {
    status: FUTURE,
    sortOrder: 0,
    content: convertToTaskContent(`
      Make good teaming a habit! Schedule a weekly Action Meeting with your
      team. Pro-tip: include a link to the meeting lobby.
    `)
  },
  {
    status: FUTURE,
    sortOrder: 1,
    content: convertToTaskContent(`
      Add integrations (like Slack, GitHub…) for your team.
      See the Integrations tab under Team Settings
    `)
  }
];

export default (userId, teamId) => {
  const r = getRethink();
  const now = new Date();

  const seedTasks = SEED_TASKS.map((proj) => ({
    ...proj,
    id: `${teamId}::${shortid.generate()}`,
    createdAt: now,
    createdBy: userId,
    tags: getTagsFromEntityMap(JSON.parse(proj.content).entityMap),
    teamId,
    assigneeId: toTeamMemberId(teamId, userId),
    userId,
    updatedAt: now
  }));

  return r.table('Task').insert(seedTasks, {returnChanges: true})
    .do((result) => {
      return r.table('TaskHistory').insert(
        result('changes').map((change) => ({
          id: shortid.generate(),
          content: change('new_val')('content'),
          taskId: change('new_val')('id'),
          status: change('new_val')('status'),
          assigneeId: change('new_val')('assigneeId'),
          updatedAt: change('new_val')('updatedAt')
        }))
      );
    });
};
