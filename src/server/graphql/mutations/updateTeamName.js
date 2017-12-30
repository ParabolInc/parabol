import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdatedTeamInput from 'server/graphql/types/UpdatedTeamInput';
import UpdateTeamPayload from 'server/graphql/types/UpdateTeamPayload';
import {requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import {TEAM, UPDATED} from 'universal/utils/constants';
import updateTeamNameValidation from './helpers/updateTeamNameValidation';


export default {
  type: UpdateTeamPayload,
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
    const team = await r.table('Team').get(teamId).update(dbUpdate, {returnChanges: true})('changes')(0)('new_val')
      .default(null);

    if (!team) {
      throw new Error('Update already called!');
    }
    const teamUpdated = {team};
    getPubSub().publish(`${TEAM}.${teamId}`, {data: {teamId, type: UPDATED}, mutatorId, operationId});
    return teamUpdated;
  }
};
