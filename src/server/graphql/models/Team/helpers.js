import r from '../../../database/rethinkDriver';

export const getTeamById = async id => await r.table('Team').get(id);
