import {phaseOrder} from 'universal/utils/constants';

export default function isSkippingAhead(reqPhase, meetingPhase) {
  const meetingIdx = phaseOrder.indexOf(meetingPhase);
  const reqPhaseIdx = phaseOrder.indexOf(reqPhase);
  return reqPhaseIdx > meetingIdx;
}

