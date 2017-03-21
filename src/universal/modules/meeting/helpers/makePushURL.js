import {LOBBY} from 'universal/utils/constants';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';

const safePhaseItem = (phaseItem) => {
  return (phaseItem <= 0 || isNaN(phaseItem)) ? 1 : phaseItem;
};

export default function makePushURL(teamId, phase = LOBBY, maybePhaseItem) {
  const phaseInfo = actionMeeting[phase];
  const phaseItem = phaseInfo.items ? safePhaseItem(maybePhaseItem) : '';
  return `/meeting/${teamId}/${phase}/${phaseItem}`;
}
