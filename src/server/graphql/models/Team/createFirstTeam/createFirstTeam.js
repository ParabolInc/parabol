import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import createNewOrg from 'server/graphql/mutations/helpers/createNewOrg';
import {getUserId, requireAuth} from 'server/utils/authorization';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import tmsSignToken from 'server/utils/tmsSignToken';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';
import addSeedProjects from './addSeedProjects';
import createFirstTeamValidation from './createFirstTeamValidation';
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader';
import NewTeamInput from 'server/graphql/types/NewTeamInput';

export default {
  // return the new JWT that has the new tms field
  type: GraphQLID,
  description: 'Create a new team and add the first team member. Called from the welcome wizard',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object with exactly 1 team member'
    }
  },
  async resolve(source, {newTeam}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireAuth(authToken);
    const userId = getUserId(authToken);

    // VALIDATION
    const {user, existingTeam} = await r({
      user: r.table('User')
        .get(userId)
        .pluck('id', 'preferredName', 'userOrgs'),
      existingTeam: r.table('Team').get(newTeam.id)('id').default(null)
    });

    if (user.userOrgs && user.userOrgs.length > 0) {
      throw new Error('cannot use createFirstTeam when already part of an org');
    }

    if (existingTeam) {
      throw new Error('Hmmm, that team id already exists, try again.');
    }

    const schema = createFirstTeamValidation();
    const {data, errors} = schema(newTeam);
    handleSchemaErrors(errors);

    // RESOLUTION
    const orgId = shortid.generate();
    const validNewTeam = {...data, orgId};
    const {id: teamId} = validNewTeam;
    const tms = [teamId];
    const orgName = `${user.preferredName}’s Org`;
    await createNewOrg(orgId, orgName, userId);
    await resolvePromiseObj({
      newTeamUpdatedUser: createTeamAndLeader(userId, validNewTeam, true),
      seedTeam: addSeedProjects(userId, teamId)
    });
    sendSegmentEvent('Welcome Step2 Completed', userId, {teamId: newTeam.id});
    return tmsSignToken(authToken, tms);
  }
};
