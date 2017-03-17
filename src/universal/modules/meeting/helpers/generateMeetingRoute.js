import getBestPhaseItem from 'universal/modules/meeting/helpers/getBestPhaseItem';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';

const generateMeetingRoute = (_nextPhaseItem, _nextPhase, props) => {
  // we're gonna mutate the heck outta these
  let nextPhase = _nextPhase;
  let nextPhaseItem = _nextPhaseItem;
  let nextPhaseInfo = actionMeeting[nextPhase];

  const {isFacilitating, team} = props;
  const {meetingPhase} = team;
  const meetingPhaseInfo = actionMeeting[meetingPhase];
  const maxIndex = isFacilitating ? meetingPhaseInfo.index + 1 : meetingPhaseInfo.index;
  if (nextPhaseInfo.index > maxIndex) return undefined;

  // set the phase
  while (true) { // eslint-disable-line no-constant-condition
    const startingPhase = nextPhase;
    // if we're trying to go someplace we can only visit once & we've already been there, go next
    if (nextPhaseInfo.visitOnce && meetingPhaseInfo.index > nextPhaseInfo.index) {
      nextPhase = nextPhaseInfo.next;
      if (!nextPhase) return undefined;
      nextPhaseInfo = actionMeeting[nextPhase];
      nextPhaseItem = undefined;
    }
    if (nextPhaseInfo.items) {
      const {arrayName, countName} = nextPhaseInfo.items;
      const count = props[countName];
      const arr = props[arrayName];
      if (count === null || arr.length < count) return undefined;
      if (arr.length === 0 || nextPhaseItem > arr.length) {
        // if there are no agenda items or they want to go to agenda item 3 of 2, goto next
        nextPhase = nextPhaseInfo.next;
        if (!nextPhase) return undefined;
        nextPhaseInfo = actionMeeting[nextPhase];
        nextPhaseItem = undefined;
      } else if (nextPhaseItem === undefined || nextPhaseItem <= 0) {
        // if they don't know where to go, give em a home
        nextPhaseItem = getBestPhaseItem(nextPhase, team);
      }
    }
    if (startingPhase === nextPhase) {
      return {nextPhase, nextPhaseItem};
    }
  }
};

export default generateMeetingRoute;
