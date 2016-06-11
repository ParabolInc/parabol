import r from '../../../database/rethinkDriver';

export const getMeetingById = async id => await r.table('Meeting').get(id);

export const getMeetingByTeamId = async teamId =>
 await r.db('actionDevelopment').table('Meeting').filter({ teamId });
