import r from '../../../database/rethinkDriver';

export const getMeetingById = async id => await r.table('Meeting').get(id);

export const getMeetingByTeamId = async meetingId =>
 await r.db('actionDevelopment').table('Meeting').filter({ meetingId });
