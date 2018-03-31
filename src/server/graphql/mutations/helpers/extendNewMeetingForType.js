import {RETROSPECTIVE} from 'universal/utils/constants';

const extendNewMeetingForType = (newMeetingBase) => {
  if (newMeetingBase.meetingType === RETROSPECTIVE) {
    return {
      ...newMeetingBase,
      reflectionGroups: [],
      reflections: []
    };
  }
  return newMeetingBase;
};

export default extendNewMeetingForType;
