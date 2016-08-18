import {cashay} from 'cashay';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';

export default (isFacilitator, memberLength, router, teamId, thisPhase, maybeNextPhase) => (nextPhaseItem) => () => {
  if (nextPhaseItem < 0) return;
  const nextPhase = nextPhaseItem < memberLength ? thisPhase : maybeNextPhase;
  nextPhaseItem = nextPhase === thisPhase ? nextPhaseItem : 0;
  if (isFacilitator) {
    const options = {variables: {nextPhase, nextPhaseItem, teamId}};
    cashay.mutate('moveMeeting', options);
  }
  const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
  router.push(pushURL);
};
