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
      email: r.row('email').default(''),
      id: r.row('id').default(''),
      name: r.row('preferredName').default('')
    });
};

const getOrgId = (teamId) => {
  const r = getRethink();
  return teamId ? r.table('Team').get(teamId)('orgId') : undefined;
};


const getSegmentProps = (userIds, teamId) => {
  return resolvePromiseObj({
    traitsArr: getTraits(userIds),
    orgId: getOrgId(teamId)
  });
};

const sendSegmentEvent = async (event, maybeUserIds, options = {}) => {
  const userIds = Array.isArray(maybeUserIds) ? maybeUserIds : [maybeUserIds];
  const {traitsArr, orgId} = await getSegmentProps(userIds, options.teamId);
  traitsArr.forEach((traitsWithId) => {
    const {id: userId, ...traits} = traitsWithId;
    segmentIo.track({
      userId,
      event,
      properties: {
        orgId,
        traits,
        // options is a superset of SegmentEventTrackOptions
        ...options
      }
    });
  });
};

export default sendSegmentEvent;
