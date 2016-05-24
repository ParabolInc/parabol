import r from '../../../database/rethinkdriver';

export const getMeetingById = async id => await r.table('Meeting').get(id);
