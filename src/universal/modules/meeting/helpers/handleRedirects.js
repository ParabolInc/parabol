import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import MoveMeetingMutation from 'universal/mutations/MoveMeetingMutation';
import {AGENDA_ITEMS, SUMMARY} from 'universal/utils/constants';
import makePushURL from './makePushURL';

export default function handleRedirects(oldProps, nextProps) {
  const {isFacilitating, localPhaseItem, history, localPhase, viewer} = nextProps;
  const {team} = viewer;
  const {viewer: oldViewer = {}} = oldProps;
  const {team: oldTeam = {}} = oldViewer;
  const oldAgenda = oldTeam.agendaItems || [];
  /* DEBUG: uncomment below */
  // console.log(`handleRedirects(${JSON.stringify(team)}, ${localPhase}, ${localPhaseItem}, ...)`);
  const {agendaItems, facilitatorPhase, facilitatorPhaseItem, meetingPhase, id: teamId, meetingId} = team;

  // DEBUGGING
  // if no/bad phase given, goto the facilitator
  const localPhaseInfo = actionMeeting[localPhase];
  if (!localPhaseInfo) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    history.replace(pushURL);
    return false;
  }

  // if the phase should be followed by a number
  if (localPhaseInfo.items) {
    const {arrayName} = localPhaseInfo.items;
    const phaseItems = team[arrayName];

    // if it's a bad number (or not a number at all)
    if (localPhaseItem > phaseItems.length || localPhaseItem <= 0) {
      // did an item get removed?
      const oldPhaseItems = oldTeam[arrayName] || [];
      if (oldPhaseItems.length > phaseItems.length) {
        // // an agenda item or team member got deleted, is it the current one?
        const nextPhaseItem = phaseItems.length;
        if (isFacilitating) {
          const variables = {
            teamId,
            nextPhaseItem
          };
          const {atmosphere, onError, onCompleted, submitMutation} = nextProps;
          submitMutation();
          MoveMeetingMutation(atmosphere, variables, history, onError, onCompleted);
        }
        const pushURL = makePushURL(teamId, facilitatorPhase, nextPhaseItem);
        history.replace(pushURL);
        return false;
      } else if (facilitatorPhase === localPhase || phaseItems.length <= 1) {
        // if they're in the same phase as the facilitator, or the phase they wanna go to has no items, go to their phase item
        const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
        history.replace(pushURL);
        return false;
      }
      // if they wanna go somewhere that the facilitator isn't take them to the beginning (url is 1-indexed)
      const pushURL = makePushURL(teamId, localPhase, 1);
      history.replace(pushURL);
      return false;
    }
  } else if (localPhaseItem !== undefined) {
    // if the url has a phase item that it shouldn't, remove it
    const pushURL = makePushURL(teamId, localPhase);
    history.replace(pushURL);
    return false;
  }

  // don't let anyone in the lobby, first call, or last call after they've been visited & the meeting has moved on
  const meetingPhaseInfo = actionMeeting[meetingPhase];
  if (localPhaseInfo.visitOnce === true && localPhaseInfo.index < meetingPhaseInfo.index) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    history.replace(pushURL);
    return false;
  }

  // don't let anyone skip to the next phase
  if (localPhaseInfo.index > meetingPhaseInfo.index) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    history.replace(pushURL);
    return false;
  }

  // is the facilitator making moves?
  if (facilitatorPhaseItem !== oldTeam.facilitatorPhaseItem ||
    facilitatorPhase !== oldTeam.facilitatorPhase) {
    // were we n'sync?
    const inSync = localPhase === oldTeam.facilitatorPhase &&
      (localPhaseItem === undefined || localPhaseItem === oldTeam.facilitatorPhaseItem);
    // Ideally, we'd do this without the DOM & ensure it's an active project card, but this works for now
    if (inSync && document.activeElement.contentEditable !== 'true') {
      const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
      history.replace(pushURL);
      return false;
    }
  }

  // check sort order for agenda items
  if (localPhase === AGENDA_ITEMS && oldAgenda.length === agendaItems.length) {
    // we made sure agendaCount was loaded above
    const oldAgendaItem = oldAgenda[localPhaseItem - 1];
    const newAgendaItem = agendaItems[localPhaseItem - 1];
    if (!newAgendaItem || newAgendaItem.id !== oldAgendaItem.id) {
      const updatedAgendaItemIdx = agendaItems.findIndex((a) => a.id === oldAgendaItem.id);
      if (updatedAgendaItemIdx !== -1) {
        const pushURL = makePushURL(teamId, AGENDA_ITEMS, updatedAgendaItemIdx + 1);
        history.replace(pushURL);
        return false;
      }
    }
  }

  if (facilitatorPhase === SUMMARY) {
    history.replace(`/summary/${meetingId}`);
    return false;
  }
  return true;
}
