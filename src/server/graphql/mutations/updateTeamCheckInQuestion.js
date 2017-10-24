import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireTeamCanUpdateCheckInQuestion} from 'server/utils/authorization';
import UpdateCheckInQuestionPayload from 'server/graphql/types/UpdateCheckInQuestionPayload';
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
  async resolve(_, {teamId, checkInQuestion}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSUOrTeamMember(authToken, teamId);
    await requireTeamCanUpdateCheckInQuestion(teamId);

    // VALIDATION
    const normalizedCheckInQuestion = normalizeRawDraftJS(checkInQuestion);

    // RESOLUTION
    const team = await r
      .table('Team')
      .get(teamId)
      .update({checkInQuestion: normalizedCheckInQuestion}, {returnChanges: true})('changes')(0)('new_val').default(null);

    // return a full object when we move to relay
    return {team};
  }
};
