import getRethink from 'server/database/rethinkDriver';
import {
  ensureUniqueId,
  requireAuth,
} from 'server/utils/authorization';
import {errorObj, handleSchemaErrors} from 'server/utils/utils';
import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import {TeamInput} from '../teamSchema';
import shortid from 'shortid';
import addSeedProjects from './addSeedProjects';
import createTeamAndLeader from './createTeamAndLeader';
import tmsSignToken from 'server/utils/tmsSignToken';
import createFirstTeamValidation from './createFirstTeamValidation';
import {TRIAL_EXPIRES_SOON} from 'universal/utils/constants';
import createNewOrg from 'server/graphql/models/Organization/addOrg/createNewOrg';
import {TRIAL_EXPIRES_SOON_DELAY} from 'server/utils/serverConstants';

export default {
  // return the new JWT that has the new tms field
  type: GraphQLID,
  description: 'Create a new team and add the first team member. Called from the welcome wizard',
  args: {
    newTeam: {
      type: new GraphQLNonNull(TeamInput),
      description: 'The new team object with exactly 1 team member'
    }
  },
  async resolve(source, {newTeam}, {authToken, unitTestCb}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const userId = requireAuth(authToken);
    const user = await r.table('User')
      .get(userId)
      .pluck('id', 'preferredName', 'userOrgs', 'trialOrg');
    if (user.userOrgs && user.userOrgs.length > 0) {
      throw errorObj({_error: 'cannot use createFirstTeam when already part of an org'});
    }
    if (user.trialOrg) {
      throw errorObj({_error: 'you have already created a team'});
    }

    // VALIDATION
    const schema = createFirstTeamValidation();
    const {data, errors} = schema(newTeam);
    handleSchemaErrors(errors);
    await ensureUniqueId('Team', newTeam.id);

    // RESOLUTION
    const orgId = shortid.generate();
    const res = await r.branch(
      r.table('User').get(userId)('trialOrg'),
      null,
      r.table('User').get(userId).update({
        tms: [newTeam.id],
        trialOrg: orgId,
        updatedAt: now
      }));
    if (!res) {
      throw errorObj({_error: 'Multiple calls detected'});
    }
    const validNewTeam = {...data, orgId};
    const {id: teamId} = validNewTeam;
    const tms = [teamId];
    // set up the team while the user is on step 3
    setTimeout(async () => {
      const expiresSoonId = shortid.generate();
      const orgName = `${user.preferredName}’s Org`;
      const {periodEnd} = await createNewOrg(orgId, orgName, userId);
      await createTeamAndLeader(userId, validNewTeam, true);
      // Asynchronously create seed projects for team leader:
      // TODO: remove me after more
      addSeedProjects(userId, teamId);
      await r.table('Notification').insert({
        id: expiresSoonId,
        type: TRIAL_EXPIRES_SOON,
        startAt: new Date(now.getTime() + TRIAL_EXPIRES_SOON_DELAY),
        orgId,
        userIds: [userId],
        // trialExpiresAt
        varList: [periodEnd]
      });
      if (unitTestCb) { unitTestCb(); }
    }, 0);
    return tmsSignToken(authToken, tms);
  }
};
