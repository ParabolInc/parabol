import getRethink from 'server/database/rethinkDriver';
import {LOBBY} from 'universal/utils/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';

export default async function createTeamAndLeader(userId, newTeam, isBillingLeader) {
  const r = getRethink();

  const {id: teamId, orgId} = newTeam;
  const teamMemberId = `${userId}::${teamId}`;

  const verifiedLeader = {
    id: teamMemberId,
    isNotRemoved: true,
    isLead: true,
    isFacilitator: true,
    checkInOrder: 0,
    teamId: teamId,
    userId
  };

  const verifiedTeam = {
    ...newTeam,
    activeFacilitator: null,
    facilitatorPhase: LOBBY,
    facilitatorPhaseItem: null,
    isPaid: true,
    meetingId: null,
    meetingPhase: LOBBY,
    meetingPhaseItem: null
  };

  const userRes = r.table('Team')
    // insert team
    .insert(verifiedTeam)
    // denormalize common fields to team member
    .do(() => {
      return r.table('User')
        .get(userId)
        .pluck('email', 'picture', 'preferredName');
    })
    .do((user) => {
      return r.table('TeamMember').insert({
        ...verifiedLeader,
        email: user('email').default(''),
        picture: user('picture').default(''),
        preferredName: user('preferredName').default('')
      });
    })
    // add teamId to user tms array
    .do(() => {
      return r.table('User')
        .get(userId)
        .update((userDoc) => ({
          billingLeaderOrgs: r.branch(isBillingLeader,
            userDoc('billingLeaderOrgs').default([]).append(orgId).distinct(),
            userDoc('billingLeaderOrgs')),
          orgs: userDoc('orgs').default([]).append(orgId).distinct(),
          tms: userDoc('tms').default([]).append(teamId).distinct()
        }));
    }, {returnChanges: true});

  const {tms} = getNewVal(userRes);
  const dbPromises = [
    dbTransaction,
    auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
  ];
  // we need to await the db transaction because adding a team requires waiting for the team to be created
  await Promise.all(dbPromises);
  return tms;
};
