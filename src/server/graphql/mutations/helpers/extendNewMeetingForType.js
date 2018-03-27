import {RETROSPECTIVE} from 'universal/utils/constants';

const extendNewMeetingForType = (newMeetingBase) => {
  switch (newMeetingBase.meetingType) {
    case RETROSPECTIVE:
    default:
      return {
        reflections: [],
        reflectionGroups: [],
        ...newMeetingBase
      };
  }
};

export default extendNewMeetingForType;
