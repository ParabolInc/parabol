import getRethink from 'server/database/rethinkDriver';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {BILLING_LEADER, LOBBY} from 'universal/utils/constants';

// used for addorg, addTeam, createFirstTeam
export default async function createTeamAndLeader(userId, newTeam, isNewOrg) {
  const r = getRethink();

  const {id: teamId, orgId} = newTeam;
  const teamMemberId = `${userId}::${teamId}`;

  const verifiedLeader = {
    id: teamMemberId,
    isCheckedIn: null,
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
    isArchived: false,
    isPaid: true,
    meetingId: null,
    meetingPhase: LOBBY,
    meetingPhaseItem: null
  };

  const {updatedUser} = await r({
    // insert team
    newTeam: r.table('Team').insert(verifiedTeam),
    // denormalize common fields to team member
    updatedTeamMember: r.table('User').get(userId)
      .pluck('email', 'picture', 'preferredName')
      .do((user) => {
        return r.table('TeamMember').insert({
          ...verifiedLeader,
          email: user('email').default(''),
          picture: user('picture').default(''),
          preferredName: user('preferredName').default('')
        });
      }),
    // add teamId to user tms array
    updatedUser: r.table('User')
      .get(userId)
      .update((userDoc) => ({
        userOrgs: r.branch(
          userDoc('userOrgs').contains((userOrg) => userOrg('id').eq(orgId)).default(false),
          userDoc('userOrgs'),
          userDoc('userOrgs').append({
            id: orgId,
            role: isNewOrg ? BILLING_LEADER : null
          })
        ),
        // using distinct disregards order (sometimes cuts the first, sometimes not)
        tms: r.branch(
          userDoc('tms').contains(teamId).default(false),
          userDoc('tms'),
          userDoc('tms').append(teamId)
        )
      }), {returnChanges: true})('changes')(0)('new_val')
      .default(null)
  });
  const {tms} = updatedUser;

  // no need to wait for auth0
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

  return tms;
};
