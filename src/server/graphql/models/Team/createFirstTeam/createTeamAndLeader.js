import getRethink from 'server/database/rethinkDriver';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {BILLING_LEADER, LOBBY} from 'universal/utils/constants';
import insertNewTeamMember from 'server/safeMutations/insertNewTeamMember';
import addUserToTMSUserOrg from 'server/safeMutations/addUserToTMSUserOrg';

// used for addorg, addTeam, createFirstTeam
export default async function createTeamAndLeader(userId, newTeam, isNewOrg) {
  const r = getRethink();

  const {id: teamId, orgId} = newTeam;
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
  const role = isNewOrg ? BILLING_LEADER : null;
  const {updatedUser} = await r({
    // insert team
    newTeam: r.table('Team').insert(verifiedTeam),
    // denormalize common fields to team member
    newTeamMember: insertNewTeamMember(userId, teamId, 0),
    // add teamId to user tms array
    updatedUser: addUserToTMSUserOrg(userId, teamId, orgId, role)
  });
  const {tms} = updatedUser.new_val;

  // no need to wait for auth0
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

  return tms;
};
