import {GraphQLInt} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import endMeeting from 'server/graphql/mutations/endMeeting';
import {requireSU} from 'server/utils/authorization';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {OLD_MEETING_AGE} from 'server/utils/serverConstants';

const endOldMeetings = {
  type: GraphQLInt,
  description: 'close all meetings that started before the given threshold',
  resolve: async (source, args, {authToken}) => {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    const activeThresh = new Date(Date.now() - OLD_MEETING_AGE);
    const idPairs = await r.table('Meeting')
      .group({index: 'teamId'}) // for each team
      .max('createdAt') // get the most recent meeting only
      .ungroup()('reduction') // return as sequence
      .filter({endedAt: null}, {default: true}) // filter to unended meetings
      .filter(r.row('createdAt').le(activeThresh))('teamId') // filter to old meetings, return teamIds
      .do((teamIds) => r.table('TeamMember')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isLead: true})
        .pluck('teamId', 'userId')
      ); // join by team leader userId
    const promises = idPairs.map(async ({teamId, userId}) => {
      await endMeeting.resolve(undefined, {teamId}, {authToken, socket: {}});
      sendSegmentEvent('endOldMeeting', userId, {teamId});
    });
    await Promise.all(promises);
    return idPairs.length;
  }
};

export default endOldMeetings;
