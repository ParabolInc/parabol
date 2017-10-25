import getRethink from 'server/database/rethinkDriver';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {BILLING_LEADER, LOBBY, PERSONAL} from 'universal/utils/constants';
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
    meetingPhaseItem: null,
    tier: PERSONAL
  };
  const options = {
    returnChanges: true,
    role: isNewOrg ? BILLING_LEADER : null
  };
  const {tms} = await r({
    // insert team
    newTeam: r.table('Team').insert(verifiedTeam),
    // denormalize common fields to team member
    newTeamMember: insertNewTeamMember(userId, teamId, {isLead: true, checkInOrder: 0}),
    // add teamId to user tms array
    tms: addUserToTMSUserOrg(userId, teamId, orgId, options)('changes')(0)('new_val')('tms')
  });

  // no need to wait for auth0
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

  return tms;
};
