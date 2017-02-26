import {BILLING_LEADER, LOBBY} from 'universal/utils/constants';
import {TRIAL_PERIOD} from 'server/utils/serverConstants'
import shortid from 'shortid';
import testUsers from 'server/__tests__/setup/testUsers';
import getRethink from 'server/database/rethinkDriver';
import mockNow from 'server/__tests__/setup/mockNow';

const now = new Date(mockNow);

const createNewOrg = async () => {
  const r = getRethink();
  const orgId = shortid.generate();
  const teamId = shortid.generate();
  const users = testUsers.map((testUser, idx) => makeUser(testUser, orgId, teamId, idx));
  const team = makeTeam(teamId, orgId);
  const teamMembers = users.map((user, idx) => makeTeamMember(user, team, idx));
  const org = makeOrg(orgId, users);
  const promises = [
    r.table('User').insert(users),
    r.table('Team').insert(team),
    r.table('TeamMember').insert(teamMembers),
    r.table('Organization').insert(org)
    ];
  await Promise.all(promises);
  return {users, team, teamMembers, org};
};

const makeUser = (baseUser, orgId, teamId, idx) => ({
  ...baseUser,
  id: `test|${baseUser.name.substr(0, 4)}_${orgId}`,
  cachedAt: now,
  createdAt: now,
  emailVerified: false,
  lastLogin: now,
  lastSeenAt: now,
  inactive: false,
  identities: [],
  picture: 'https://placeimg.com/100/100/animals',
  tms: [teamId],
  trialOrg: idx === 0 ? orgId : null,
  updatedAt: now,
  userOrgs: [{
    id: orgId,
    role: BILLING_LEADER,
  }],
  welcomeSentAt: now,
});

const makeTeam = (teamId, orgId) => ({
  id: teamId,
  orgId,
  teamName: 'Team America',
  activeFacilitator: null,
  facilitatorPhase: LOBBY,
  facilitatorPhaseItem: null,
  isPaid: true,
  meetingId: null,
  meetingPhase: LOBBY,
  meetingPhaseItem: null
});

const makeTeamMember = (user, team, idx) => ({
  id: `${user.id}::${team.id}`,
  isNotRemoved: true,
  isLead: idx === 0,
  isFacilitator: false,
  checkInOrder: idx,
  teamId: team.id,
  userId: user.id,
  email: user.email,
  picture: user.picture,
  preferredName: user.preferredName
});

const makeOrg = (orgId, users) => ({
  id: orgId,
  createdAt: now,
  name: 'The Averagers, Inc.',
  orgUsers: users.map((user, idx) => ({
    id: user.id,
    role: idx === 0 ? BILLING_LEADER : null,
    inactive: false
  })),
  stripeId: `cus_${orgId}`,
  stripeSubscriptionId: `sub_${orgId}`,
  updatedAt: now,
  periodEnd: new Date(now.getTime() + TRIAL_PERIOD),
  periodStart: now,
});

export default createNewOrg;
