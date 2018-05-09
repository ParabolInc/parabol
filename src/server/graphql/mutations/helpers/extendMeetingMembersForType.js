import {RETROSPECTIVE} from 'universal/utils/constants';

const extendMeetingMembersForType = async (meetingMembers, dataLoader) => {
  const {meetingType, teamId} = meetingMembers[0];
  if (meetingType === RETROSPECTIVE) {
    const allSettings = await dataLoader.get('meetingSettingsByTeamId').load(teamId);
    const retroSettings = allSettings.find((settings) => settings.meetingType === RETROSPECTIVE);
    const {totalVotes} = retroSettings;
    return meetingMembers.map((member) => ({
      ...member,
      votesRemaining: totalVotes
    }));
  }
  return meetingMembers;
};

export default extendMeetingMembersForType;
