import {cashay} from 'cashay';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import {phaseArray, phaseOrder} from 'universal/utils/constants';
import hasPhaseItem from './hasPhaseItem';

export default (isFacilitating, totalPhaseItems, router, teamId, thisPhase) => (nextPhaseItem) => () => {
  if (nextPhaseItem < 1) return;
  const gotoNextPhase = nextPhaseItem > totalPhaseItems;
  const nextPhase = gotoNextPhase ? phaseArray[phaseOrder(thisPhase) + 1] : thisPhase;
  nextPhaseItem = gotoNextPhase ? 1 : nextPhaseItem;
  if (isFacilitating) {
    const variables = {teamId};
    if (gotoNextPhase) {
      variables.nextPhase = nextPhase;
    }
    if (hasPhaseItem(nextPhase)) {
      variables.nextPhaseItem = nextPhaseItem;
    }
    cashay.mutate('moveMeeting', {variables});
  }
  const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
  router.push(pushURL);
};
