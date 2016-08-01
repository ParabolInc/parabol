import {AGENDA, CHECKIN, LOBBY, UPDATES, SUMMARY} from 'universal/utils/constants';
import makePushURL from './makePushURL';
import getLocalPhase from './getLocalPhase';
import isSkippingAhead from './isSkippingAhead';

export default function handleRedirects(team, children, localPhaseItem, pathname, router) {
  const {facilitatorPhase, facilitatorPhaseItem, meetingPhase, id: teamId} = team;
  // bail out fast while we're waiting for the team sub
  if (!teamId) return;
  if (!children) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
  }

  const localPhase = getLocalPhase(pathname, teamId);

// add a localPhaseItem to the url
  if (localPhaseItem === undefined && localPhase !== LOBBY && localPhase !== SUMMARY) {
    if (facilitatorPhase === localPhase) {
      const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
      router.replace(pushURL);
    } else if (localPhase === CHECKIN || localPhase === UPDATES) {
      const pushURL = makePushURL(teamId, localPhase, '0');
      router.replace(pushURL);
    } else if (localPhase === AGENDA) {
      // TODO
    }
  }

  // don't let anyone in the lobby after the meeting has started
  if (localPhase === LOBBY && facilitatorPhase && facilitatorPhase !== LOBBY) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
  }

  // don't let anyone skip to the next phase
  if (isSkippingAhead(localPhase, meetingPhase)) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
  }
};
