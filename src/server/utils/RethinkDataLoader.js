import getRethink from 'server/database/rethinkDriver';
import DataLoader from 'dataloader';

const defaultCacheKeyFn = (key) => key;

const indexResults = (results, indexField, cacheKeyFn = defaultCacheKeyFn) => {
  const indexedResults = new Map();
  results.forEach((res) => {
    indexedResults.set(cacheKeyFn(res[indexField]), res);
  });
  return indexedResults;
};

const normalizeRethinkDbResults = (keys, indexField, cacheKeyFn = defaultCacheKeyFn) => (results) => {
  const indexedResults = indexResults(results, indexField, cacheKeyFn);
  return keys.map((val) => indexedResults.get(cacheKeyFn(val)) || new Error(`Key not found : ${val}`));
};

const makeStandardLoader = (table) => {
  const batchFn = async (keys) => {
    const r = getRethink();
    const docs = await r.table(table)
      .getAll(r.args(keys), {index: 'id'});
    return normalizeRethinkDbResults(keys, 'id')(docs)
  }
  return new DataLoader(batchFn);
};


export default class RethinkDataLoader {
  users = makeStandardLoader('User');
  organizations = makeStandardLoader('Organization');
  orgsByUserId = new DataLoader(async (userIds) => {
    const r = getRethink();
    const orgs = await r.table('Organization')
      .getAll(r.args(userIds), {index: 'orgUsers'});
    orgs.forEach((org) => {
      this.organizations.prime(org.id, org);
    });
    return userIds.map((userId) => {
      return orgs.filter((org) => Boolean(org.orgUsers.find((orgUser) => orgUser.id === userId)));
    })
  })
}



