import getRethink from 'server/database/rethinkDriver';
import {
  requireSUOrTeamMember,
  requireWebsocket
} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';
import {
  SUMMARY,
} from 'universal/utils/constants';
import resetMeeting from './resetMeeting';
import {makeSuccessExpression, makeSuccessStatement} from 'universal/utils/makeSuccessCopy';
import getEndMeetingSortOrders from 'server/graphql/models/Team/endMeeting/getEndMeetingSortOrders';

export default {
  type: GraphQLBoolean,
  description: 'Finish a meeting and go to the summary',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that will be having the meeting'
    }
  },
  async resolve(source, {teamId}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    requireWebsocket(socket);
    requireSUOrTeamMember(authToken, teamId);
    const meeting = await r.table('Meeting')
    // get the most recent meeting
      .getAll(teamId, {index: 'teamId'})
      .orderBy(r.desc('createdAt'))
      .nth(0)
      .pluck('id', 'endedAt')
      .default({endedAt: r.now()});
    if (meeting.endedAt) {
      throw errorObj({_error: 'Meeting already ended!'});
    }

    // RESOLUTION
    const now = new Date();
    const meetingId = meeting.id;
    const completedMeeting = await r.table('AgendaItem')
    // get all agenda items
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true, isComplete: true})
      .map((doc) => doc('id'))
      .coerceTo('array')
      .do((agendaItemIds) => {
        // delete any null actions
        return r.table('Action')
          .getAll(r.args(agendaItemIds), {index: 'agendaId'})
          .filter((row) => row('content').eq(null))
          .delete()
          .do(() => {
            // delete any null projects
            return r.table('Project')
              .getAll(r.args(agendaItemIds), {index: 'agendaId'})
              .filter((row) => row('content').eq(null))
              .delete();
          })
          .do(() => {
            // grab all the actions and projects
            return {
              actions: r.table('Action')
                .getAll(r.args(agendaItemIds), {index: 'agendaId'})
                // we still need to filter because this may occur before we delete them above (not guaranteed in sync)
                .filter((row) => row('content').ne(null))
                .map((row) => row.merge({id: r.expr(meetingId).add('::').add(row('id'))}))
                .orderBy('createdAt')
                .pluck('id', 'content', 'teamMemberId')
                .coerceTo('array'),
              projects: r.table('Project')
                .getAll(r.args(agendaItemIds), {index: 'agendaId'})
                .filter((row) => row('content').ne(null))
                .map((row) => row.merge({id: r.expr(meetingId).add('::').add(row('id'))}))
                .orderBy('createdAt')
                .pluck('id', 'content', 'status', 'teamMemberId')
                .coerceTo('array')
            };
          })
          .do((res) => {
            return r.table('Meeting').get(meetingId)
              .update({
                actions: res('actions').default([]),
                agendaItemsCompleted: agendaItemIds.count().default(0),
                endedAt: now,
                facilitator: `${authToken.sub}::${teamId}`,
                successExpression: makeSuccessExpression(),
                successStatement: makeSuccessStatement(),
                invitees: r.table('TeamMember')
                  .getAll(teamId, {index: 'teamId'})
                  .filter({isNotRemoved: true})
                  .orderBy('preferredName')
                  .coerceTo('array')
                  .map((teamMember) => ({
                    id: teamMember('id'),
                    actions: res('actions').default([]).filter({teamMemberId: teamMember('id')}),
                    picture: teamMember('picture'),
                    preferredName: teamMember('preferredName'),
                    present: teamMember('isCheckedIn').not().not()
                      .default(false),
                    projects: res('projects').default([]).filter({teamMemberId: teamMember('id')})
                  })),
                projects: res('projects').default([]),
              }, {nonAtomic: true, returnChanges: true})('changes')(0)('new_val').pluck('projects', 'invitees');
          });
      });
    const {updatedActions, updatedProjects} = await getEndMeetingSortOrders(completedMeeting);
    await r.expr(updatedActions)
      .forEach((action) => {
        return r.table('Action').get(action('id')).update({
          sortOrder: action('sortOrder')
        });
      })
      .do(() => {
        return r.expr(updatedProjects)
          .forEach((project) => {
            return r.table('Project').get(project('id')).update({
              sortOrder: project('sortOrder')
            });
          });
      })
      .do(() => {
        // send to summary view
        return r.table('Team').get(teamId)
          .update({
            facilitatorPhase: SUMMARY,
            meetingPhase: SUMMARY,
            facilitatorPhaseItem: null,
            meetingPhaseItem: null,
          });
      });

    // reset the meeting
    resetMeeting(teamId);
    return true;
  }
};
