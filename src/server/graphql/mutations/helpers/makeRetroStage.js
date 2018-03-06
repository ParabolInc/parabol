import {CHECKIN} from 'universal/utils/constants';
import shortid from 'shortid';

const makeRetroStage = async (phaseType, meetingId, isFacilitatorPhase) => {
  return {
    id: shortid.generate(),
    meetingId,
    isFacilitatorStage: isFacilitatorPhase,
    isComplete: false,
    phaseType
  };
};

export default makeRetroStage;
