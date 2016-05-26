import r from '../../../database/rethinkDriver';

export const getMeetingById = async id => await r.table('Meeting').get(id);
