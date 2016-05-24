import r from '../../../database/rethinkdriver';

export const getTeamById = async id => await r.table('Team').get(id);
