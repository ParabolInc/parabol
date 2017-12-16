import getRethink from 'server/database/rethinkDriver';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {BILLING_LEADER, LOBBY} from 'universal/utils/constants';
import insertNewTeamMember from 'server/safeMutations/insertNewTeamMember';
import addUserToTMSUserOrg from 'server/safeMutations/addUserToTMSUserOrg';

// used for addorg, addTeam, createFirstTeam
export default async function createTeamAndLeader(userId, newTeam, isNewOrg) {
  const r = getRethink();

  const {id: teamId, orgId} = newTeam;
  const organization = await r.table('Organization').get(orgId);
  const {tier} = organization;
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
    tier
  };
  const options = {
    returnChanges: true,
    role: isNewOrg ? BILLING_LEADER : null
  };
  const res = await r({
    // insert team
    team: r.table('Team').insert(verifiedTeam, {returnChanges: true})('changes')(0)('new_val').default(null),
    // denormalize common fields to team member
    teamLead: insertNewTeamMember(userId, teamId, {isLead: true, checkInOrder: 0}),
    // add teamId to user tms array
    tms: addUserToTMSUserOrg(userId, teamId, orgId, options)('changes')(0)('new_val')('tms')
  });

  const {tms} = res;

  // no need to wait for auth0
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

  return res;
};
