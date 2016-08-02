import {phaseOrder} from 'universal/utils/constants';

export default function isSkippingAhead(reqPhase, meetingPhase) {
  const meetingIdx = phaseOrder(meetingPhase);
  const reqPhaseIdx = phaseOrder(reqPhase);
  return reqPhaseIdx > meetingIdx;
}

