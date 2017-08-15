import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getEndMeetingSortOrders from 'server/graphql/models/Team/endMeeting/getEndMeetingSortOrders';
import {endSlackMeeting} from 'server/graphql/models/Team/notifySlack/notifySlack';
import {getSegmentTraitsForUsers, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import segmentIo from 'server/utils/segmentIo';
import {errorObj} from 'server/utils/utils';
import {SUMMARY} from 'universal/utils/constants';
import {makeSuccessExpression, makeSuccessStatement} from 'universal/utils/makeSuccessCopy';
import resetMeeting from './resetMeeting';

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
      .filter({isActive: true})
      .map((doc) => doc('id'))
      .coerceTo('array')
      .do((agendaItemIds) => {
        return r.table('Project')
          .getAll(r.args(agendaItemIds), {index: 'agendaId'})
          .map((row) => row.merge({id: r.expr(meetingId).add('::').add(row('id'))}))
          .orderBy('createdAt')
          .pluck('id', 'content', 'status', 'tags', 'teamMemberId')
          .coerceTo('array')
          .default([])
          .do((projects) => {
            return r.table('Meeting').get(meetingId)
              .update({
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
                    picture: teamMember('picture'),
                    preferredName: teamMember('preferredName'),
                    present: teamMember('isCheckedIn').not().not()
                      .default(false),
                    projects: projects.filter({teamMemberId: teamMember('id')})
                  })),
                projects
              }, {
                nonAtomic: true,
                returnChanges: true
              })('changes')(0)('new_val').pluck('invitees', 'meetingNumber', 'projects');
          });
      });
    const updatedProjects = await getEndMeetingSortOrders(completedMeeting);
    await r.expr(updatedProjects)
      .forEach((project) => {
        return r.table('Project').get(project('id')).update({
          sortOrder: project('sortOrder')
        });
      })
      .do(() => {
        // send to summary view
        return r.table('Team').get(teamId)
          .update({
            facilitatorPhase: SUMMARY,
            meetingPhase: SUMMARY,
            facilitatorPhaseItem: null,
            meetingPhaseItem: null
          });
      });
    // dispatch segment events:
    getSegmentTraitsForUsers(
      // extract user part of id from x::y invitee:
      completedMeeting.invitees
        .filter((invitee) => invitee.present)
        .map((invitee) => invitee.id.split('::')[0])
    ).then((segmentTraits) =>
      segmentTraits.forEach((traits) => {
        segmentIo.track({
          userId: traits.id,
          teamId,
          event: 'Meeting Completed',
          properties: {
            meetingNumber: completedMeeting.meetingNumber,
            teamId,
            traits
          }
        });
      })
    );
    // reset the meeting
    resetMeeting(teamId);
    endSlackMeeting(meetingId, teamId);
    return true;
  }
};
