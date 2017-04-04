import getRethink from 'server/database/rethinkDriver';
import {BILLING_LEADER, LOBBY} from 'universal/utils/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getNewVal} from 'server/utils/utils';

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
            userDoc('userOrgs').contains((userOrg) => userOrg('id').eq(orgId)).default(false),
            userDoc('userOrgs'),
            userDoc('userOrgs').append({
              id: orgId,
              role: isNewOrg ? BILLING_LEADER : null
            })
          ),
          tms: userDoc('tms')
            .default([])
            .do((tms) => {
              // using distinct disregards order (sometimes cuts the first, sometimes not)
              return r.branch(
                tms.contains(teamId),
                tms,
                tms.append(teamId)
              );
            })
        }), {returnChanges: true});
    });

  const {tms} = getNewVal(userRes);

  // no need to wait for auth0
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

  return tms;
};
