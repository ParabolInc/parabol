/* Phases */
export const LOBBY = 'lobby';
export const CHECKIN = 'checkin';
export const UPDATES = 'updates';
export const AGENDA = 'agenda';
export const SUMMARY = 'summary';
export const phaseArray = [LOBBY, CHECKIN, UPDATES, AGENDA, SUMMARY];
export const phaseOrder = phase => phaseArray.indexOf(phase);
