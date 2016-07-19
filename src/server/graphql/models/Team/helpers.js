import r from 'server/database/rethinkDriver';

export const getTeamById = async id => await r.table('Team').get(id);

export const getTeamByTeamId = async teamId =>
 await r.db('actionDevelopment').table('Team').filter({ teamId });
