import {
  getUserId,
  getUserOrgDoc,
  isBillingLeader,
  ensureUniqueId,
  requireUserInOrg,
  requireWebsocket
} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';
import {TeamInput} from '../teamSchema';
import getRethink from 'server/database/rethinkDriver';

export default {
  type: GraphQLBoolean,
  description: 'Delete (NOT ARCHIVE) a team',
  args: {
    deletedTeam: {
      type: new GraphQLNonNull(TeamInput),
      description: 'Delete (NOT ARCHIVE) a team'
    }
  },
  async resolve(source, args, {authToken, socket}) {
    // // AUTH
    // const {orgId} = args.deletedTeam;
    // requireWebsocket(socket);
    // const userId = getUserId(authToken);
    // const userOrgDoc = await getUserOrgDoc(userId, orgId);
    // requireUserInOrg(userOrgDoc, userId, orgId);
    //
    // // VALIDATION
    // const {data: {deletedTeam}, errors} = addTeamValidation()(args);
    // const {id: teamId} = deletedTeam;
    // handleSchemaErrors(errors);
    // await ensureUniqueId('Team', teamId);
    //
    // // RESOLUTION
    // const newAuthToken = {
    //   ...authToken,
    //   tms: Array.isArray(authToken.tms) ? authToken.tms.concat(teamId) : [teamId],
    //   exp: undefined
    // };
    // socket.setAuthToken(newAuthToken);
    const r = getRethink();
    const {id: teamId} = args.deletedTeam;
    console.log('teamID is:', teamId);
    await r.table('Team')
      .get(teamId)
      .delete();

    return true;
  }
};
