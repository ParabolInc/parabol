import getRethink from 'server/database/rethinkDriver';
import segmentIo from 'server/utils/segmentIo';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';
import countTiersForUserId from 'server/graphql/queries/helpers/countTiersForUserId';

const getTraits = (userIds) => {
  const r = getRethink();
  return r.table('User')
    .getAll(r.args(userIds), {index: 'id'})
    .map({
      avatar: r.row('picture').default(''),
      createdAt: r.row('createdAt').default(0),
      email: r.row('email').default(''),
      id: r.row('id').default(''),
      name: r.row('preferredName').default(''),
      parabolId: r.row('id').default('') // passed as a distinct trait name for HubSpot
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

export const sendSegmentIdentify = async (maybeUserIds) => {
  const userIds = Array.isArray(maybeUserIds) ? maybeUserIds : [maybeUserIds];
  const traitsArr = await getTraits(userIds);
  traitsArr.forEach(async (traitsWithId) => {
    const {id: userId, ...traits} = traitsWithId;
    const tiersCountTraits = await countTiersForUserId(userId);
    segmentIo.identify({
      userId,
      traits: {
        ...traits,
        ...tiersCountTraits
      }
    });
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
