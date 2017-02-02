import getRethink from 'server/database/rethinkDriver';
import {BILLING_LEADER, LOBBY} from 'universal/utils/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getNewVal} from 'server/utils/utils';

// used for addorg, addTeam, createTeam
export default async function createTeamAndLeader(userId, newTeam, isNewOrg) {
  const r = getRethink();

  const {id: teamId, orgId} = newTeam;
  const teamMemberId = `${userId}::${teamId}`;

  const verifiedLeader = {
    id: teamMemberId,
    isNotRemoved: true,
    isLead: true,
    isFacilitator: true,
    checkInOrder: 0,
    teamId,
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

  const userRes = await r.table('Team')
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
          userOrgs: r.branch(
            userDoc('userOrgs').default([]).contains((userOrg) => userOrg('id').eq(orgId)),
            userDoc('userOrgs'),
            userDoc('userOrgs').append({
              id: orgId,
              role: isNewOrg ? BILLING_LEADER : null
            })
          ),
          tms: userDoc('tms').default([]).append(teamId).distinct()
        }), {returnChanges: true})
    });

  const {tms} = getNewVal(userRes);

  // we need to await the db transaction because adding a team requires waiting for the team to be created
  await auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});
  return tms;
}
;
