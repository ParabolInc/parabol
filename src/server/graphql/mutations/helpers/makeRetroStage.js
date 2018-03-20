import shortid from 'shortid';

const makeRetroStage = (phaseType, meetingId) => {
  return {
    id: shortid.generate(),
    meetingId,
    isComplete: false,
    phaseType
  };
};

export default makeRetroStage;
