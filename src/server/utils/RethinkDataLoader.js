import DataLoader from 'dataloader';
import getRethink from 'server/database/rethinkDriver';
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
  // return keys.map((val) => indexedResults.get(cacheKeyFn(val)));
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

const makeCustomLoader = (batchFn, options) => {
  // Make a default {} because if we forget this, then it'll be a tricky memory leak to find DEV only
  if (!options) {
    console.warn('Did you forget the options?', batchFn);
  }
  return new DataLoader(batchFn, options);
};

// const groupByField = (arr, fieldName) => {
//  const obj = {};
//  for (let ii = 0; ii < arr.length; ii++) {
//    const doc = arr[ii];
//    const fieldVal = doc[fieldName];
//    obj[fieldVal] = obj[fieldVal] || [];
//    obj[fieldVal].push(doc);
//  }
//  return obj;
// };
const primeStandardLoader = (loader, items) => {
  items.forEach((item) => {
    loader.prime(item.id, item);
  });
};


export default class RethinkDataLoader {
  constructor(authToken, dataloaderOptions = {}) {
    this.authToken = authToken;
    this.dataloaderOptions = dataloaderOptions;
    // doing this ugly stuff in the constructor because class properties are created before constructor is called
    this.orgsByUserId = makeCustomLoader(async (userIds) => {
      const r = getRethink();
      const orgs = await r.table('Organization')
        .getAll(r.args(userIds), {index: 'orgUsers'});
      primeStandardLoader(this.organizations, orgs);
      return userIds.map((userId) => {
        return orgs.filter((org) => Boolean(org.orgUsers.find((orgUser) => orgUser.id === userId)));
      });
    }, this.dataloaderOptions);
    this.projectsByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink();
      const userId = getUserId(this.authToken);
      const projects = await r.table('Project')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((project) => project('tags')
          .contains('private').and(project('userId').ne(userId))
          .or(project('tags').contains('archived'))
          .not());
      primeStandardLoader(this.projects, projects);
      return teamIds.map((teamId) => {
        return projects.filter((project) => project.teamId === teamId);
      });
    }, this.dataloaderOptions);
    this.projectsByUserId = makeCustomLoader(async (userIds) => {
      const r = getRethink();
      const userId = getUserId(this.authToken);
      const {tms} = this.authToken;
      const projects = await r.table('Project')
        .getAll(userId, {index: 'userId'})
        .filter((project) => r.and(
          project('tags').contains('archived').not(),
          // weed out the projects on archived teams
          r(tms).contains(project('teamId'))
        ));
      primeStandardLoader(this.projects, projects);
      return userIds.map(() => projects);
    }, this.dataloaderOptions);
    this.softTeamMembersByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink();
      const softTeamMembers = await r.table('SoftTeamMember')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isActive: true});
      primeStandardLoader(this.softTeamMembers, softTeamMembers);
      return teamIds.map((teamId) => {
        return softTeamMembers.filter((softTeamMember) => softTeamMember.teamId === teamId);
      });
    }, this.dataloaderOptions);
    this.teamMembersByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink();
      const teamMembers = await r.table('TeamMember')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isNotRemoved: true});
      primeStandardLoader(this.teamMembers, teamMembers);
      return teamIds.map((teamId) => {
        return teamMembers.filter((teamMember) => teamMember.teamId === teamId);
      });
    }, this.dataloaderOptions);
    this.agendaItemsByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink();
      const agendaItems = await r.table('AgendaItem')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isActive: true});
      primeStandardLoader(this.agendaItems, agendaItems);
      return teamIds.map((teamId) => {
        return agendaItems.filter((agendaItem) => agendaItem.teamId === teamId);
      });
    }, this.dataloaderOptions);
  }

  _share() {
    this.authToken = null;
  }

  agendaItems = makeStandardLoader('AgendaItem');
  invitations = makeStandardLoader('Invitation');
  organizations = makeStandardLoader('Organization');
  orgApprovals = makeStandardLoader('OrgApproval');
  meetings = makeStandardLoader('Meeting');
  notifications = makeStandardLoader('Notification');
  projects = makeStandardLoader('Project');
  softTeamMembers = makeStandardLoader('SoftTeamMember');
  teams = makeStandardLoader('Team');
  teamMembers = makeStandardLoader('TeamMember');
  users = makeStandardLoader('User');
}

