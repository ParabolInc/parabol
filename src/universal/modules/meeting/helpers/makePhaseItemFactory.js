import {cashay} from 'cashay';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import {phaseArray, phaseOrder} from 'universal/utils/constants';

export default (isFacilitating, totalPhaseItems, router, teamId, thisPhase) => (nextPhaseItem) => () => {
  console.log( 'next');
  if (nextPhaseItem < 1) return;
  const gotoNextPhase = nextPhaseItem > totalPhaseItems;
  const nextPhase = gotoNextPhase ? phaseArray[phaseOrder(thisPhase) + 1] : thisPhase;
  nextPhaseItem = gotoNextPhase ? 1 : nextPhaseItem;
  if (isFacilitating) {
    const options = {variables: {nextPhase, nextPhaseItem, teamId}};
    cashay.mutate('moveMeeting', options);
  }
  const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
  router.push(pushURL);
};
