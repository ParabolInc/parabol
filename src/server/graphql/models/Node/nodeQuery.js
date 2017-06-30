import {fromGlobalId, nodeDefinitions} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';

const globalIdFetcher = (globalId) => {
  const { type, id } = fromGlobalId(globalId);
  const r = getRethink();
  switch (type) {
    case 'Provider':
      return r.table('Provider').get(id);
    default:
      return null;
  }
};

const globalTypeResolver = (obj) => {
  console.log('OBJ in typeResolver', obj);
  return obj.type;
};

const nodeDefs = nodeDefinitions(
  globalIdFetcher,
  globalTypeResolver
);

export const {nodeInterface} = nodeDefs;

export default {
  node: nodeDefs.nodeField
};
