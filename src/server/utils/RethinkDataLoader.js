import DataLoader from 'dataloader';
import getRethink from 'server/database/rethinkDriver';
import {getUserId} from 'server/utils/authorization';
import sendSentryEvent from 'server/utils/sendSentryEvent';

const defaultCacheKeyFn = (key) => key;

const indexResults = (results, indexField, cacheKeyFn = defaultCacheKeyFn) => {
  const indexedResults = new Map();
  results.forEach((res) => {
    indexedResults.set(cacheKeyFn(res[indexField]), res);
  });
  return indexedResults;
};

const sendErrorToSentry = (authToken, key, keys, indexedResults) => {
  const breadcrumb = {
    message: 'Dataloader key not found',
    category: 'dataloader',
    data: {
      key,
      keys,
      indexedResults
    }
  };
  sendSentryEvent(authToken, breadcrumb);
};

const normalizeRethinkDbResults = (keys, indexField, cacheKeyFn = defaultCacheKeyFn) => (results, authToken) => {
  const indexedResults = indexResults(results, indexField, cacheKeyFn);
  // return keys.map((val) => indexedResults.get(cacheKeyFn(val)) || new Error(`Key not found : ${val}`));
  return keys.map((val) => {
    const res = indexedResults.get(cacheKeyFn(val));
    if (!res) {
      sendErrorToSentry(authToken, cacheKeyFn(val), keys, indexedResults);
    }
    return res;
  });
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
export const primeStandardLoader = (loader, items) => {
  items.forEach((item) => {
    loader.clear(item.id).prime(item.id, item);
  });
};


export default class RethinkDataLoader {
  constructor(authToken, dataloaderOptions = {}) {
    this.authToken = authToken;
    this.dataloaderOptions = dataloaderOptions;
    this.customPhaseItemsByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink();
      const customPhaseItems = await r.table('CustomPhaseItem')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isActive: true});
      primeStandardLoader(this.customPhaseItems, customPhaseItems);
      return teamIds.map((teamId) => {
        return customPhaseItems.filter((phaseItem) => phaseItem.teamId === teamId);
      });
    }, this.dataloaderOptions);
    // doing this ugly stuff in the constructor because class properties are created before constructor is called
    this.meetingSettingsByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink();
      const meetingSettings = await r.table('MeetingSettings')
        .getAll(r.args(teamIds), {index: 'teamId'});
      primeStandardLoader(this.meetingSettings, meetingSettings);
      return teamIds.map((teamId) => {
        return meetingSettings.filter((settings) => settings.teamId === teamId);
      });
    }, this.dataloaderOptions);
    this.orgsByUserId = makeCustomLoader(async (userIds) => {
      const r = getRethink();
      const orgs = await r.table('Organization')
        .getAll(r.args(userIds), {index: 'orgUsers'});
      primeStandardLoader(this.organizations, orgs);
      return userIds.map((userId) => {
        return orgs.filter((org) => Boolean(org.orgUsers.find((orgUser) => orgUser.id === userId)));
      });
    }, this.dataloaderOptions);
    this.retroReflectionsByGroupId = makeCustomLoader(async (reflectionGroupIds) => {
      const r = getRethink();
      const retroReflections = await r.table('RetroReflection')
        .getAll(r.args(reflectionGroupIds), {index: 'reflectionGroupId'})
        .filter({isActive: true});
      primeStandardLoader(this.activeRetroReflections, retroReflections);
      return reflectionGroupIds.map((reflectionGroupId) => {
        return retroReflections.filter((retroReflection) => retroReflection.reflectionGroupId === reflectionGroupId);
      });
    }, this.dataloaderOptions);
    this.retroReflectionsByMeetingId = makeCustomLoader(async (meetingIds) => {
      const r = getRethink();
      const retroReflections = await r.table('RetroReflection')
        .getAll(r.args(meetingIds), {index: 'meetingId'})
        .filter({isActive: true});
      primeStandardLoader(this.activeRetroReflections, retroReflections);
      return meetingIds.map((meetingId) => {
        return retroReflections.filter((retroReflection) => retroReflection.meetingId === meetingId);
      });
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
    this.tasksByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink();
      const userId = getUserId(this.authToken);
      const tasks = await r.table('Task')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((task) => task('tags')
          .contains('private').and(task('userId').ne(userId))
          .or(task('tags').contains('archived'))
          .not());
      primeStandardLoader(this.tasks, tasks);
      return teamIds.map((teamId) => {
        return tasks.filter((task) => task.teamId === teamId);
      });
    }, this.dataloaderOptions);
    this.tasksByUserId = makeCustomLoader(async (userIds) => {
      const r = getRethink();
      const userId = getUserId(this.authToken);
      const {tms} = this.authToken;
      const tasks = await r.table('Task')
        .getAll(userId, {index: 'userId'})
        .filter((task) => r.and(
          task('tags').contains('archived').not(),
          // weed out the tasks on archived teams
          r(tms).contains(task('teamId'))
        ));
      primeStandardLoader(this.tasks, tasks);
      return userIds.map(() => tasks);
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
  makeStandardLoader(table, filter = {}) {
    const batchFn = async (keys) => {
      const r = getRethink();
      const docs = await r.table(table)
        .getAll(r.args(keys), {index: 'id'})
        .filter(filter);
      return normalizeRethinkDbResults(keys, 'id')(docs, this.authToken);
    };
    return new DataLoader(batchFn);
  }

  agendaItems = this.makeStandardLoader('AgendaItem');
  customPhaseItems = this.makeStandardLoader('CustomPhaseItem');
  invitations = this.makeStandardLoader('Invitation');
  meetings = this.makeStandardLoader('Meeting');
  meetingSettings = this.makeStandardLoader('MeetingSettings');
  newMeetings = this.makeStandardLoader('NewMeeting');
  notifications = this.makeStandardLoader('Notification');
  orgApprovals = this.makeStandardLoader('OrgApproval');
  organizations = this.makeStandardLoader('Organization');
  retroReflectionGroups = this.makeStandardLoader('RetroReflectionGroup');
  activeRetroReflections = this.makeStandardLoader('RetroReflection', {isActive: true});
  inactiveRetroReflections = this.makeStandardLoader('RetroReflection', {isActive: false});
  softTeamMembers = this.makeStandardLoader('SoftTeamMember');
  tasks = this.makeStandardLoader('Task');
  teamMembers = this.makeStandardLoader('TeamMember');
  teams = this.makeStandardLoader('Team');
  users = this.makeStandardLoader('User');
}
