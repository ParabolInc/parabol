import {RETROSPECTIVE} from 'universal/utils/constants';

const extendNewMeetingForType = (newMeetingBase) => {
  switch (newMeetingBase.meetingType) {
    case RETROSPECTIVE:
    default:
      return newMeetingBase;
  }
};

export default extendNewMeetingForType;
