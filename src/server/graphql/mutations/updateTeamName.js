import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdatedTeamInput from 'server/graphql/types/UpdatedTeamInput';
import UpdateTeamNamePayload from 'server/graphql/types/UpdateTeamNamePayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {handleSchemaErrors} from 'server/utils/utils';
import {TEAM} from 'universal/utils/constants';
import updateTeamNameValidation from './helpers/updateTeamNameValidation';


export default {
  type: UpdateTeamNamePayload,
  args: {
    updatedTeam: {
      type: new GraphQLNonNull(UpdatedTeamInput),
      description: 'The input object containing the teamId and any modified fields'
    }
  },
  async resolve(source, {updatedTeam}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    requireTeamMember(authToken, updatedTeam.id);

    // VALIDATION
    const {errors, data: {id: teamId, name}} = updateTeamNameValidation()(updatedTeam);
    handleSchemaErrors(errors);

    // RESOLUTION
    const dbUpdate = {
      name,
      updatedAt: now
    };
    await r.table('Team').get(teamId).update(dbUpdate);

    const data = {teamId};
    publish(TEAM, teamId, UpdateTeamNamePayload, data, subOptions);
    return data;
  }
};
