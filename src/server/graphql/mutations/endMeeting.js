import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getEndMeetingSortOrders from 'server/graphql/mutations/helpers/endMeeting/getEndMeetingSortOrders';
import sendEmailSummary from 'server/graphql/mutations/helpers/endMeeting/sendEmailSummary';
import {endSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack';
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload';
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {DONE, LOBBY, TASK, TEAM} from 'universal/utils/constants';
import {makeSuccessExpression, makeSuccessStatement} from 'universal/utils/makeSuccessCopy';

export default {
  type: EndMeetingPayload,
  description: 'Finish a meeting and go to the summary',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that will be having the meeting'
    }
  },
  async resolve(source, {teamId}, {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    requireTeamMember(authToken, teamId);
    const meeting = await r.table('Meeting')
    // get the most recent meeting
      .getAll(teamId, {index: 'teamId'})
      .orderBy(r.desc('createdAt'))
      .nth(0)
      .default({endedAt: r.now()});
    if (meeting.endedAt) {
      throw new Error('Meeting already ended!');
    }

    // RESOLUTION
    const now = new Date();
    const {id: meetingId} = meeting;
    const completedMeeting = await r.table('Task')
      .getAll(teamId, {index: 'teamId'})
      .filter((task) => r.and(
        task('createdAt').ge(meeting.createdAt),
        task('tags').contains('private').not()
      ))
      .map((row) => row.merge({id: r.expr(meetingId).add('::').add(row('id'))}))
      .orderBy('createdAt')
      .pluck('id', 'content', 'status', 'tags', 'assigneeId')
      .coerceTo('array')
      .default([])
      .do((tasks) => {
        return r.table('Meeting').get(meetingId)
          .update({
            agendaItemsCompleted: r.table('AgendaItem')
              .getAll(teamId, {index: 'teamId'})
              .filter({isActive: true})
              .count()
              .default(0),
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
                picture: teamMember('picture'),
                preferredName: teamMember('preferredName'),
                present: teamMember('isCheckedIn').not().not()
                  .default(false),
                tasks: tasks.filter({assigneeId: teamMember('id')})
              })),
            tasks
          }, {
            nonAtomic: true,
            returnChanges: true
          })('changes')(0)('new_val');
      });
    const updatedTasks = await getEndMeetingSortOrders(completedMeeting);
    const {tasksToArchive, team} = await r({
      updatedSortOrders: r(updatedTasks)
        .forEach((task) => {
          return r.table('Task').get(task('id')).update({
            sortOrder: task('sortOrder')
          });
        }),
      team: r.table('Team').get(teamId)
        .update({
          facilitatorPhase: LOBBY,
          meetingPhase: LOBBY,
          meetingId: null,
          facilitatorPhaseItem: null,
          meetingPhaseItem: null,
          activeFacilitator: null
        }, {returnChanges: true})('changes')(0)('new_val'),
      agenda: r.table('AgendaItem').getAll(teamId, {index: 'teamId'})
        .update({
          isActive: false
        }),
      // shuffle the teamMember check in order, uncheck them in
      teamMember: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .sample(100000)
        .coerceTo('array')
        .do((arr) => arr.forEach((doc) => {
          return r.table('TeamMember').get(doc('id'))
            .update({
              checkInOrder: arr.offsetsOf(doc).nth(0),
              isCheckedIn: null
            });
        })),
      tasksToArchive: r.table('Task').getAll(teamId, {index: 'teamId'})
        .filter({status: DONE})
        .filter((task) => task('tags').contains('archived').not())
        .pluck('id', 'content', 'tags')
        .coerceTo('array')
    });

    const archivedTasks = await archiveTasksForDB(tasksToArchive, dataLoader);
    const {meetingNumber} = completedMeeting;
    const userIds = completedMeeting.invitees
      .filter((invitee) => invitee.present)
      .map((invitee) => invitee.id.split('::')[0]);
    sendSegmentEvent('Meeting Completed', userIds, {teamId, meetingNumber});
    endSlackMeeting(meetingId, teamId);

    const data = {
      team,
      archivedTasks,
      meetingId
    };
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId);

    publish(TEAM, teamId, EndMeetingPayload, data, subOptions);
    teamMembers.forEach(({userId}) => {
      publish(TASK, userId, EndMeetingPayload, data, subOptions);
    });
    await sendEmailSummary(completedMeeting);

    return data;
  }
};
