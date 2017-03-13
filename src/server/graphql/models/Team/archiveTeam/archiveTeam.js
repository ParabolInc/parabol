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
import shortid from 'shortid';
import {TEAM_ARCHIVED} from 'universal/utils/constants';
import archiveTeamValidation from './archiveTeamValidation';

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

    // AUTH
    requireSUOrTeamMember(authToken, updatedTeam.id);
    requireWebsocket(socket);

    // VALIDATION
    const {errors, data: {id, name, isArchived}} = archiveTeamValidation()(updatedTeam);
    handleSchemaErrors(errors);

    // RESOLUTION
    await r.table('Team').get(id).update({isArchived});

    setTimeout(async() => {
      const notifId = shortid.generate();
      const now = new Date();
      const {orgId} = await r.table('Team').get(id).pluck('orgId');
      const teamMembers = await r.table('TeamMember')
        .filter({teamId: id})
        .pluck('userId');
      const userIds = teamMembers.map(member => member.userId);
      await r.table('Notification').insert({
        id: notifId,
        type: TEAM_ARCHIVED,
        startAt: now,
        orgId,
        userIds,
        varList: [name]
      });
    }, 0);

    return true;
  }
};
