import {fromGlobalId, nodeDefinitions} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';

// very much still a WIP. It'll be useful for list/detail views
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

export const {nodeInterface, nodeField} = nodeDefs;