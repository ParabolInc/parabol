import getRethink from 'server/database/rethinkDriver';
import segmentIo from 'server/utils/segmentIo';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';

const getTraits = (userIds) => {
  const r = getRethink();
  return r.table('User')
    .getAll(r.args(userIds), {index: 'id'})
    .map({
      avatar: r.row('picture').default(''),
      createdAt: r.row('createdAt').default(0),
      email: r.row('email'),
      id: r.row('id'),
      name: r.row('preferredName')
    })
};

const getOrgId = (teamId) => {
  const r = getRethink();
  return teamId ? r.table('Team').get(teamId)('orgId') : undefined;
};


const getSegmentProps = (userIds, teamId) => {
  return userIds.map(resolvePromiseObj({
    traits: getTraits(userIds),
    orgId: getOrgId(teamId)
  }));
};

const sendSegmentEvent = async (event, maybeUserIds, options) => {
  const userIds = Array.isArray(maybeUserIds) ? maybeUserIds : [maybeUserIds];
  const properties = await getSegmentProps(userIds, options.teamId);
  userIds.forEach((userId, idx) => {
    segmentIo.track({
      userId,
      event,
      properties: {
        ...properties[idx],
        ...options
      }
    });
  });
};

export default sendSegmentEvent;