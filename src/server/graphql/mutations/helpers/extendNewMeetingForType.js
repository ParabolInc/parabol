import {RETROSPECTIVE} from 'universal/utils/constants';

const extendNewMeetingForType = (newMeetingBase) => {
  if (newMeetingBase.meetingType === RETROSPECTIVE) {
    return {
      ...newMeetingBase,
      thoughtGroups: [],
      thoughts: []
    };
  }
  return newMeetingBase;
};

export default extendNewMeetingForType;
