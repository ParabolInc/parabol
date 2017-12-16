import getRethink from 'server/database/rethinkDriver';
import {
  requireTeamMember,
  requireWebsocket
} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import {
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql';
import updateTeamNameValidation from './updateTeamNameValidation';
import UpdatedTeamInput from 'server/graphql/types/UpdatedTeamInput';


export default {
  type: GraphQLBoolean,
  args: {
    updatedTeam: {
      type: new GraphQLNonNull(UpdatedTeamInput),
      description: 'The input object containing the teamId and any modified fields'
    }
  },
  async resolve(source, {updatedTeam}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    requireTeamMember(authToken, updatedTeam.id);
    requireWebsocket(socket);

    // VALIDATION
    const {errors, data: {id, name}} = updateTeamNameValidation()(updatedTeam);
    handleSchemaErrors(errors);

    // RESOLUTION
    const dbUpdate = {
      name,
      updatedAt: now
    };
    await r.table('Team').get(id).update(dbUpdate);
    return true;
  }
};
