import shortid from 'shortid';
import getRethink from 'server/database/rethinkDriver';
import {SLACK} from 'universal/utils/constants';

const insertSlackChannel = (channelId, channelName, teamId) => {
  const r = getRethink();
  return r.table(SLACK).insert({
    id: shortid.generate(),
    isActive: true,
    channelId,
    channelName,
    notifications: ['meeting:end', 'meeting:start'],
    teamId
  }, {returnChanges: true})('changes')(0)('new_val');
};

export default insertSlackChannel;