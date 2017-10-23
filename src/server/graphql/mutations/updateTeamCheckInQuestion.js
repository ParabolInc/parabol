import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';

import getRethink from 'server/database/rethinkDriver';
import {isSuperUser, requireSUOrTeamMember, requireTeamCanUpdateCheckInQuestion} from 'server/utils/authorization';

export default {
  type: new GraphQLNonNull(GraphQLString),
  description: "Update a Team's Check-in question",
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of the Team which will have its Check-in question updated'
    },
    checkInQuestion: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The Team's new Check-in question"
    }
  },
  async resolve(_, {teamId, checkInQuestion}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSUOrTeamMember(authToken, teamId);
    if (!isSuperUser(authToken)) {
      await requireTeamCanUpdateCheckInQuestion(teamId);
    }

    // RESOLUTION
    await r
      .table('Team')
      .get(teamId)
      .update({checkInQuestion});

    return checkInQuestion;
  }
};
