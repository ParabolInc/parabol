import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import createNewOrg from 'server/graphql/mutations/helpers/createNewOrg';
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader';
import CreateFirstTeamPayload from 'server/graphql/types/CreateFirstTeamPayload';
import NewTeamInput from 'server/graphql/types/NewTeamInput';
import {getUserId, requireAuth} from 'server/utils/authorization';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import tmsSignToken from 'server/utils/tmsSignToken';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';
import addSeedProjects from './helpers/addSeedProjects';
import createFirstTeamValidation from './helpers/createFirstTeamValidation';

export default {
  type: CreateFirstTeamPayload,
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
    const user = await r.table('User')
      .get(userId)
      .pluck('id', 'preferredName', 'userOrgs');

    if (user.userOrgs && user.userOrgs.length > 0) {
      throw new Error('cannot use createFirstTeam when already part of an org');
    }

    const schema = createFirstTeamValidation();
    const {data: {name}, errors} = schema(newTeam);
    handleSchemaErrors(errors);

    // RESOLUTION
    const orgId = shortid.generate();
    const teamId = shortid.generate();
    const validNewTeam = {id: teamId, orgId, name};
    const orgName = `${user.preferredName}’s Org`;
    await createNewOrg(orgId, orgName, userId);
    const {newTeamUpdatedUser: {team, teamLead, tms}} = await resolvePromiseObj({
      newTeamUpdatedUser: createTeamAndLeader(userId, validNewTeam, true),
      seedTeam: addSeedProjects(userId, teamId)
    });
    sendSegmentEvent('Welcome Step2 Completed', userId, {teamId});
    return {
      team,
      teamLead,
      jwt: tmsSignToken(authToken, tms)
    };
  }
};
