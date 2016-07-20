import r from 'server/database/rethinkDriver';

export const getTeamById = async id => await r.table('Team').get(id);
