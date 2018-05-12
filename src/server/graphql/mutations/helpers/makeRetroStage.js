// @flow
import shortid from 'shortid';
import type {NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';

const makeRetroStage = (
  phaseType: NewMeetingPhaseTypeEnum,
  meetingId: string,
  phaseIdx: number
) => {
  return {
    id: shortid.generate(),
    meetingId,
    isComplete: false,
    isNavigable: false,
    isNavigableByFacilitator: phaseIdx === 1,
    phaseType
  };
};

export default makeRetroStage;
