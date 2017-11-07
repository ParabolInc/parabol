import getRethink from 'server/database/rethinkDriver';
import DataLoader from 'dataloader';
import {getUserId} from 'server/utils/authorization';

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
    return normalizeRethinkDbResults(keys, 'id')(docs);
  };
  return new DataLoader(batchFn);
};

const groupByField = (arr, fieldName) => {
  const obj = {};
  for (let ii = 0; ii < arr.length; ii++) {
    const doc = arr[ii];
    const fieldVal = doc[fieldName];
    obj[fieldVal] = obj[fieldVal] || [];
    obj[fieldVal].push(doc);
  }
  return obj;
};

export default class RethinkDataLoader {
  constructor(authToken, dataloaderOptions) {
    this.authToken = authToken;
    this.dataloaderOptions = dataloaderOptions;
  }

  _makeCustomLoader(batchFn) {
    return new DataLoader(batchFn, this.dataloaderOptions);
  }
  _share() {
    this.authToken = null;
  }
  agendaItems = makeStandardLoader('AgendaItem');
  users = makeStandardLoader('User');
  organizations = makeStandardLoader('Organization');
  orgsByUserId = this._makeCustomLoader(async (userIds) => {
    const r = getRethink();
    const orgs = await r.table('Organization')
      .getAll(r.args(userIds), {index: 'orgUsers'});
    orgs.forEach((org) => {
      this.organizations.prime(org.id, org);
    });
    return userIds.map((userId) => {
      return orgs.filter((org) => Boolean(org.orgUsers.find((orgUser) => orgUser.id === userId)));
    });
  });
  projectsByAgendaId = this._makeCustomerLoader(async (agendaIds) => {
    const r = getRethink();
    const projects = await r.table('Projects')
      .getAll(r.args(agendaIds), {index: 'agendaId'});
    return agendaIds.map((agendaId) => {
      return projects.filter((project) => project.agendaId === agendaId);
    });
  });
  projectsByTeamId = this._makeCustomerLoader(async (teamIds) => {
    const r = getRethink();
    const userId = getUserId(this.authToken);
    const projects = await r.table('Project')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((project) => project('tags')
        .contains('private').and(project('userId').ne(userId))
        .or(project('tags').contains('archived'))
        .not());
    // cannot prime by agendaId because this doesn't fetch private or archived things
    return teamIds.map((teamId) => {
      return projects.filter((project) => project.teamId === teamId);
    });
  });
  projectsByUserId = this._makeCustomerLoader(async (userIds) => {
    const r = getRethink();
    const userId = getUserId(this.authToken);
    const projects = await r.table('Project')
      .getAll(userId, {index: 'userId'})
      .filter((project) => project('tags').contains('archived').not());
    return userIds.map(() => projects);
  });
  teams = makeStandardLoader('Team');
  teamMembers = makeStandardLoader('TeamMember');
}

