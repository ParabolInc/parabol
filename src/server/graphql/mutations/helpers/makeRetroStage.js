// @flow
import shortid from 'shortid';
import type {NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';

const makeRetroStage = (phaseType: NewMeetingPhaseTypeEnum, meetingId: string) => {
  return {
    id: shortid.generate(),
    meetingId,
    isComplete: false,
    phaseType
  };
};

export default makeRetroStage;
