import getRethink from 'server/database/rethinkDriver';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {
  ACTION,
  AGENDA_ITEMS,
  BILLING_LEADER,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  LOBBY,
  RETRO_PHASE_ITEM,
  RETROSPECTIVE,
  RETROSPECTIVE_TOTAL_VOTES_DEFAULT,
  RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT,
  REFLECT,
  UPDATES,
  VOTE
} from 'universal/utils/constants';
import insertNewTeamMember from 'server/safeMutations/insertNewTeamMember';
import addUserToTMSUserOrg from 'server/safeMutations/addUserToTMSUserOrg';
import shortid from 'shortid';

// used for addorg, addTeam, createFirstTeam
export default async function createTeamAndLeader (userId, newTeam, isNewOrg) {
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
  const meetingSettings = [
    {
      id: shortid.generate(),
      meetingType: RETROSPECTIVE,
      teamId,
      phaseTypes: [CHECKIN, REFLECT, GROUP, VOTE, DISCUSS],
      totalVotes: RETROSPECTIVE_TOTAL_VOTES_DEFAULT,
      maxVotesPerGroup: RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT
    },
    {
      id: shortid.generate(),
      meetingType: ACTION,
      teamId,
      phaseTypes: [CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL]
    }
  ];

  const customPhaseItems = [
    {
      id: shortid.generate(),
      phaseItemType: RETRO_PHASE_ITEM,
      isActive: true,
      teamId,
      title: 'Positive',
      question: 'What’s working?'
    },
    {
      id: shortid.generate(),
      phaseItemType: RETRO_PHASE_ITEM,
      isActive: true,
      teamId,
      title: 'Negative',
      question: 'Where did you get stuck?'
    }
  ];
  const res = await r({
    // insert team
    team: r
      .table('Team')
      .insert(verifiedTeam, {returnChanges: true})('changes')(0)('new_val')
      .default(null),
    // add meeting settings
    teamSettings: r.table('MeetingSettings').insert(meetingSettings),
    // add customizable phase items for meetings
    customPhaseItems: r.table('CustomPhaseItem').insert(customPhaseItems),
    // denormalize common fields to team member
    teamLead: insertNewTeamMember(userId, teamId, {
      isLead: true,
      checkInOrder: 0
    }),
    // add teamId to user tms array
    tms: addUserToTMSUserOrg(userId, teamId, orgId, options)('changes')(0)('new_val')('tms')
  });

  const {tms} = res;

  // no need to wait for auth0
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

  return res;
}
