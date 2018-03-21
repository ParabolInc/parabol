import {RETROSPECTIVE} from 'universal/utils/constants';

const extendNewMeetingForType = async (meetingMembers, dataLoader) => {
  const {meetingType, teamId} = meetingMembers[0];
  if (meetingType === RETROSPECTIVE) {
    const meetingSettings = await dataLoader.get('meetingSettingsByTeamId').load(teamId);
    const {totalVotes} = meetingSettings;
    return meetingMembers.map((member) => ({
      ...member,
      votesRemaining: totalVotes
    }));
  }
  return meetingMembers;
};

export default extendNewMeetingForType;
