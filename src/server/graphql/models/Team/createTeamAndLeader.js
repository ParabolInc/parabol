import getRethink from 'server/database/rethinkDriver';
import {requireAuth} from '../authorization';
import {errorObj} from '../utils';
import {LOBBY} from 'universal/utils/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';

export default async function createTeamAndLeader(authToken, newTeam) {
  const r = getRethink();
  const userId = requireAuth(authToken);
  if (newTeam.id.length > 10 || newTeam.id.indexOf('::') !== -1) {
    throw errorObj({_error: 'Bad id'});
  }
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

  const dbTransaction = r.table('User')
    .get(userId)
    .do((user) =>
      r.table('TeamMember').insert({
        ...verifiedLeader,
        // pull in picture and preferredName from user profile:
        picture: user('picture').default(''),
        preferredName: user('preferredName').default('')
      })
    )
    .do(() =>
      r.table('Team').insert(verifiedTeam)
    );

  const oldtms = authToken.tms || [];
  const tms = oldtms.concat(newTeam.id);
  const dbPromises = [
    dbTransaction,
    auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
  ];
  await Promise.all(dbPromises);
  return tms;
};
