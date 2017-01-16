import getRethink from 'server/database/rethinkDriver';
import {getUserId} from '../../authorization';
import {LOBBY} from 'universal/utils/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';

export default async function createTeamAndLeader(authToken, newTeam) {
  const r = getRethink();
  const userId = getUserId(authToken);
  const teamMemberId = `${userId}::${newTeam.id}`;

  const verifiedLeader = {
    id: teamMemberId,
    isNotRemoved: true,
    isLead: true,
    isFacilitator: true,
    checkInOrder: 0,
    teamId: newTeam.id,
    userId
  };

  const verifiedTeam = {
    ...newTeam,
    facilitatorPhase: LOBBY,
    meetingPhase: LOBBY,
    meetingId: null,
    facilitatorPhaseItem: null,
    meetingPhaseItem: null,
    activeFacilitator: null
  };

  // rethinkDB do method doesn't guarantee order, so we have to separate this one
  // grabbing it from the client isn't 100% safe since they could have been removed & then call this function to renew it
  const currentUser = await r.table('User').get(userId);
  const tms = currentUser.tms ? currentUser.tms.concat(newTeam.id) : [newTeam.id];

  const dbTransaction = r.table('Team')
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
        .update({
          tms
        });
    });

  const dbPromises = [
    dbTransaction,
    auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
  ];
  // we need to await the db transaction because adding a team requires waiting for the team to be created
  await Promise.all(dbPromises);
  return tms;
};
