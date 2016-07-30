/* Phases */
export const LOBBY = 'lobby';
export const CHECKIN = 'checkin';
export const UPDATES = 'updates';
export const REQUESTS = 'requests';
export const SUMMARY = 'summary';
export const phaseArray = [LOBBY, CHECKIN, UPDATES, REQUESTS, SUMMARY];
export const phaseOrder = phase => phaseArray.indexOf(phase);
