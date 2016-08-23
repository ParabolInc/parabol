import {
  LOBBY,
  // CHECKIN,
  // UPDATES,
  FIRST_CALL,
  AGENDA_ITEMS,
  LAST_CALL,
  // SUMMARY
  phaseOrder} from 'universal/utils/constants';
import makePushURL from './makePushURL';
import isSkippingAhead from './isSkippingAhead';
import hasPhaseItem from './hasPhaseItem';
export default function handleRedirects(team, localPhase, localPhaseItem, router) {
  const {facilitatorPhase, facilitatorPhaseItem, meetingPhase, id: teamId, meetingId} = team;
  // bail out fast while we're waiting for the team sub
  if (!teamId) return;

  // DEBUGGING
  // if no phase given, goto the facilitator
  if (!localPhase) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
    return;
  }
  if (hasPhaseItem(localPhase)) {
    // the url should have a phase item
    if (isNaN(localPhaseItem)) {
      // if the url doesn't have a phase item, but they wanna go where the facilitator is, put them in sync
      if (facilitatorPhase === localPhase) {
        const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
        router.replace(pushURL);
        return;
      }
      // if they wanna go somewhere that the facilitator isn't take them to the beginning (url is 1-indexed)
      const pushURL = makePushURL(teamId, localPhase, 1);
      router.replace(pushURL);
      return;
    }
  } else if (localPhaseItem !== undefined && isNaN(localPhaseItem)) {
    // if the url has a phase item that it shouldn't
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
    return;
  }

  // don't let anyone in the lobby after the meeting has started
  if (localPhase === LOBBY && meetingId) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
    return;
  }

  // don't let anyone skip to the next phase
  // TODO if the facilitator SOMEHOW skips ahead, it goes here we enter an infinite loop
  if (isSkippingAhead(localPhase, meetingPhase)) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
    return;
  }

  // don't let users go back to an agenda soundoff, take them to the agenda processing
  if (localPhase === FIRST_CALL || localPhase === LAST_CALL) {
    if (phaseOrder(meetingPhase) > phaseOrder(localPhase)) {
      const agendaItem = facilitatorPhase === AGENDA_ITEMS ? facilitatorPhaseItem : 1;
      const pushURL = makePushURL(teamId, AGENDA_ITEMS, agendaItem);
      router.replace(pushURL);
      return;
    }
  }

  /*
   * For agenda items, the localPhase should point to the sortOrder
   * This works great for all cases, except when someone skipped to a future agenda item & then its sort order changes
   * In that event, the url should change, but the content shouldnt
   * so, when we get new props we should have logic that sees if the underlying ID has changed
   * or conversely, if the person is not in sync, then redirect them to the sortOrder of where they were
   * */
}
