import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateCheckInQuestionPayload from 'server/graphql/types/UpdateCheckInQuestionPayload';
import {requireTeamCanUpdateCheckInQuestion, requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {TEAM} from 'universal/subscriptions/constants';
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
  async resolve(source, {teamId, checkInQuestion}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    requireTeamMember(authToken, teamId);
    await requireTeamCanUpdateCheckInQuestion(teamId);

    // VALIDATION
    const normalizedCheckInQuestion = normalizeRawDraftJS(checkInQuestion);

    // RESOLUTION
    await r.table('Team')
      .get(teamId)
      .update({checkInQuestion: normalizedCheckInQuestion});

    const data = {teamId};
    publish(TEAM, teamId, UpdateCheckInQuestionPayload, data, subOptions);
    return data;
  }
};
