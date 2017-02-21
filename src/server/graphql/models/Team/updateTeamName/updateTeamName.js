import getRethink from 'server/database/rethinkDriver';
import {
  requireSUOrTeamMember,
  requireWebsocket
} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import {
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';
import {TeamInput} from '../teamSchema';
import updateTeamNameValidation from './updateTeamNameValidation';


export default {
  type: GraphQLBoolean,
  args: {
    updatedTeam: {
      type: new GraphQLNonNull(TeamInput),
      description: 'The input object containing the teamId and any modified fields'
    }
  },
  async resolve(source, {updatedTeam}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    requireSUOrTeamMember(authToken, updatedTeam.id);
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
