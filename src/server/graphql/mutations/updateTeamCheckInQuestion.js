import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateCheckInQuestionPayload from 'server/graphql/types/UpdateCheckInQuestionPayload';
import {requireSUOrTeamMember, requireTeamCanUpdateCheckInQuestion} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {MEETING_UPDATED} from 'universal/utils/constants';
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS';

export default {
  type: UpdateCheckInQuestionPayload,
  description: 'Update a Team\'s Check-in question',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of the Team which will have its Check-in question updated'
    },
    checkInQuestion: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The Team\'s new Check-in question'
    }
  },
  async resolve(source, {teamId, checkInQuestion}, {authToken, getDataLoader, socketId}) {
    const r = getRethink();
    const dataLoader = getDataLoader();
    const operationId = dataLoader.share();

    // AUTH
    requireSUOrTeamMember(authToken, teamId);
    await requireTeamCanUpdateCheckInQuestion(teamId);

    // VALIDATION
    const normalizedCheckInQuestion = normalizeRawDraftJS(checkInQuestion);

    // RESOLUTION
    const team = await r.table('Team')
      .get(teamId)
      .update({checkInQuestion: normalizedCheckInQuestion}, {returnChanges: true})('changes')(0)('new_val').default(null);

    const meetingUpdated = {team};
    getPubSub().publish(`${MEETING_UPDATED}.${teamId}`, {meetingUpdated, mutatorId: socketId, operationId});
    return meetingUpdated;
  }
};
