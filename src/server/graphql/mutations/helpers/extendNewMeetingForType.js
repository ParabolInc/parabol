import {RETROSPECTIVE} from 'universal/utils/constants';

const extendNewMeetingForType = (newMeetingBase, meetingType) => {
  if (meetingType === RETROSPECTIVE) {
    return {
      ...newMeetingBase,
      thoughtGroups: [],
      thoughts: []
    };
  }
  return newMeetingBase;
};

export default extendNewMeetingForType;
