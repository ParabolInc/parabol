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
import makeStep2Schema from 'universal/validation/makeStep2Schema';
import {TRIAL_EXPIRES_SOON} from 'universal/utils/constants';
import ms from 'ms';
import createStripeOrg from 'server/graphql/models/Organization/addOrg/createStripeOrg';

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
  async resolve(source, {newTeam}, {authToken}) {
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
    const schema = makeStep2Schema();
    const {data, errors} = schema(newTeam);
    handleSchemaErrors(errors);
    await ensureUniqueId('Team', newTeam.id);

    // RESOLUTION
    const orgId = shortid.generate();
    const res = await r.branch(
      r.table('User').get(userId)('trialOrg'),
      null,
      r.table('User').get(userId).update({
        trialOrg: orgId,
        updatedAt: now
      }));
    if (!res) {
      throw errorObj({_error: 'Multiple calls detected'});
    }
    const validNewTeam = {...data, orgId};
    const expiresSoonId = shortid.generate();
    const orgName = `${user.preferredName}'s Org`;
    const {validUntil} = await createStripeOrg(orgId, orgName, true, userId, now);
    await r.table('Notification').insert({
      id: expiresSoonId,
      type: TRIAL_EXPIRES_SOON,
      startAt: new Date(now + ms('14d')),
      orgId,
      userIds: [userId],
      // trialExpiresAt
      varList: [validUntil]
    });
    const tms = await createTeamAndLeader(userId, validNewTeam, true);
    // Asynchronously create seed projects for team leader:
    // TODO: remove me after more
    addSeedProjects(authToken.sub, newTeam.id);
    return tmsSignToken(authToken, tms);
  }
}
