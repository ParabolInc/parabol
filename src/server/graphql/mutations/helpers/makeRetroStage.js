import shortid from 'shortid';

const makeRetroStage = (phaseType, meetingId, isFacilitatorPhase) => {
  return {
    id: shortid.generate(),
    meetingId,
    isFacilitatorStage: isFacilitatorPhase,
    isComplete: false,
    phaseType
  };
};

export default makeRetroStage;
