import getRethink from 'server/database/rethinkDriver';
import segmentIo from 'server/utils/segmentIo';

const getSegmentProps = (maybeUserIds, teamId) => {
  const userIds = Array.isArray(maybeUserIds) ? maybeUserIds : [maybeUserIds];
  const r = getRethink();
  return r.expr({
    traits: r.table('User')
      .getAll(r.args(userIds), {index: 'id'})
      .map({
        avatar: r.row('picture').default(''),
        createdAt: r.row('createdAt').default(0),
        email: r.row('email'),
        id: r.row('id'),
        name: r.row('preferredName')
      }),
    orgId: r.table('Team').get(teamId)('orgId')
  });
};

const sendSegmentEvent = async (event, userId, teamId) => {
  const properties = await getSegmentProps(userId, teamId);
  segmentIo.track({
    userId,
    event,
    properties: {
      ...properties,
      teamId
    }
  });
};

export default sendSegmentEvent;