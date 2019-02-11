import DataLoader from 'dataloader'
import getRethink from 'server/database/rethinkDriver'
import {getUserId} from 'server/utils/authorization'
import sendToSentry from 'server/utils/sendToSentry'

const defaultCacheKeyFn = (key) => key

const indexResults = (results, indexField, cacheKeyFn = defaultCacheKeyFn) => {
  const indexedResults = new Map()
  results.forEach((res) => {
    indexedResults.set(cacheKeyFn(res[indexField]), res)
  })
  return indexedResults
}

const normalizeRethinkDbResults = (keys, indexField, cacheKeyFn = defaultCacheKeyFn) => (
  results,
  authToken,
  table
) => {
  const indexedResults = indexResults(results, indexField, cacheKeyFn)
  // return keys.map((val) => indexedResults.get(cacheKeyFn(val)) || new Error(`Key not found : ${val}`));
  return keys.map((val) => {
    const res = indexedResults.get(cacheKeyFn(val))
    if (!res) {
      const viewerId = getUserId(authToken)
      sendToSentry(new Error(`dataloader not found for ${cacheKeyFn(val)}, on ${table}`), {
        userId: viewerId
      })
      return null
    }
    return res
  })
}

const makeCustomLoader = (batchFn, options) => {
  // Make a default {} because if we forget this, then it'll be a tricky memory leak to find DEV only
  if (!options) {
    console.warn('Did you forget the options?', batchFn)
  }
  return new DataLoader(batchFn, options)
}

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
    loader.clear(item.id).prime(item.id, item)
  })
}

export default class RethinkDataLoader {
  constructor (authToken, dataloaderOptions = {}) {
    this.authToken = authToken
    this.dataloaderOptions = dataloaderOptions
    this.customPhaseItemsByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink()
      const customPhaseItems = await r
        .table('CustomPhaseItem')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isActive: true})
      primeStandardLoader(this.customPhaseItems, customPhaseItems)
      return teamIds.map((teamId) => {
        return customPhaseItems.filter((phaseItem) => phaseItem.teamId === teamId)
      })
    }, this.dataloaderOptions)
    this.meetingMembersByMeetingId = makeCustomLoader(async (meetingIds) => {
      const r = getRethink()
      const meetingMembers = await r
        .table('MeetingMember')
        .getAll(r.args(meetingIds), {index: 'meetingId'})
      primeStandardLoader(this.meetingMembers, meetingMembers)
      return meetingIds.map((meetingId) => {
        return meetingMembers.filter((member) => member.meetingId === meetingId)
      })
    }, this.dataloaderOptions)
    // doing this ugly stuff in the constructor because class properties are created before constructor is called
    this.meetingSettingsByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink()
      const meetingSettings = await r
        .table('MeetingSettings')
        .getAll(r.args(teamIds), {index: 'teamId'})
      primeStandardLoader(this.meetingSettings, meetingSettings)
      return teamIds.map((teamId) => {
        return meetingSettings.filter((settings) => settings.teamId === teamId)
      })
    }, this.dataloaderOptions)
    this.notificationsByUserId = makeCustomLoader(async (userIds) => {
      const r = getRethink()
      const viewerId = getUserId(this.authToken)
      const notifications = await r
        .table('Notification')
        .getAll(viewerId, {index: 'userIds'})
        .filter((notification) =>
          notification('isArchived')
            .default(false)
            .ne(true)
        )
      primeStandardLoader(this.notifications, notifications)
      return userIds.map(() => notifications)
    }, this.dataloaderOptions)
    this.organizationUsersByOrgId = makeCustomLoader(async (orgIds) => {
      const r = getRethink()
      const organizationUsers = await r
        .table('OrganizationUser')
        .getAll(r.args(orgIds), {index: 'orgId'})
        .filter({removedAt: null})
      primeStandardLoader(this.organizationUsers, organizationUsers)
      return orgIds.map((orgId) => {
        return organizationUsers.filter((organizationUser) => organizationUser.orgId === orgId)
      })
    }, this.dataloaderOptions)
    this.organizationUsersByUserId = makeCustomLoader(async (userIds) => {
      const r = getRethink()
      const organizationUsers = await r
        .table('OrganizationUser')
        .getAll(r.args(userIds), {index: 'userId'})
        .filter({removedAt: null})
      primeStandardLoader(this.organizationUsers, organizationUsers)
      return userIds.map((userId) => {
        return organizationUsers.filter((organizationUser) => organizationUser.userId === userId)
      })
    }, this.dataloaderOptions)
    this.retroReflectionGroupsByMeetingId = makeCustomLoader(async (meetingIds) => {
      const r = getRethink()
      const retroReflectionGroups = await r
        .table('RetroReflectionGroup')
        .getAll(r.args(meetingIds), {index: 'meetingId'})
        .filter({isActive: true})
      primeStandardLoader(this.retroReflectionGroups, retroReflectionGroups)
      return meetingIds.map((meetingId) => {
        return retroReflectionGroups.filter(
          (retroReflection) => retroReflection.meetingId === meetingId
        )
      })
    }, this.dataloaderOptions)
    this.reflectTemplatesByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink()
      const reflectTemplates = await r
        .table('ReflectTemplate')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isActive: true})
      primeStandardLoader(this.reflectTemplates, reflectTemplates)
      return teamIds.map((teamId) => {
        return reflectTemplates.filter((template) => template.teamId === teamId)
      })
    }, this.dataloaderOptions)
    this.retroReflectionsByMeetingId = makeCustomLoader(async (meetingIds) => {
      const r = getRethink()
      const retroReflections = await r
        .table('RetroReflection')
        .getAll(r.args(meetingIds), {index: 'meetingId'})
        .filter({isActive: true})
      primeStandardLoader(this.retroReflections, retroReflections)
      return meetingIds.map((meetingId) => {
        return retroReflections.filter((retroReflection) => retroReflection.meetingId === meetingId)
      })
    }, this.dataloaderOptions)
    this.softTeamMembersByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink()
      const softTeamMembers = await r
        .table('SoftTeamMember')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isActive: true})
      primeStandardLoader(this.softTeamMembers, softTeamMembers)
      return teamIds.map((teamId) => {
        return softTeamMembers.filter((softTeamMember) => softTeamMember.teamId === teamId)
      })
    }, this.dataloaderOptions)
    this.suggestedActionsByUserId = makeCustomLoader(async (userIds) => {
      const r = getRethink()
      const suggestedActions = await r
        .table('SuggestedAction')
        .getAll(r.args(userIds), {index: 'userId'})
        .filter({removedAt: null})
      primeStandardLoader(this.suggestedActions, suggestedActions)
      return userIds.map((userId) => {
        return suggestedActions.filter((suggestedAction) => suggestedAction.userId === userId)
      })
    }, this.dataloaderOptions)
    this.tasksByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink()
      const userId = getUserId(this.authToken)
      const tasks = await r
        .table('Task')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((task) =>
          task('tags')
            .contains('private')
            .and(task('userId').ne(userId))
            .or(task('tags').contains('archived'))
            .not()
        )
      primeStandardLoader(this.tasks, tasks)
      return teamIds.map((teamId) => {
        return tasks.filter((task) => task.teamId === teamId)
      })
    }, this.dataloaderOptions)
    this.tasksByUserId = makeCustomLoader(async (userIds) => {
      const r = getRethink()
      const userId = getUserId(this.authToken)
      const tms = this.authToken.tms || []
      const tasks = await r
        .table('Task')
        .getAll(userId, {index: 'userId'})
        .filter((task) =>
          r.and(
            task('tags')
              .contains('archived')
              .not(),
            // weed out the tasks on archived teams
            r(tms).contains(task('teamId'))
          )
        )
      primeStandardLoader(this.tasks, tasks)
      return userIds.map(() => tasks)
    }, this.dataloaderOptions)
    this.teamsByOrgId = makeCustomLoader(async (orgIds) => {
      const r = getRethink()
      const tms = this.authToken.tms || []
      const teams = await r
        .table('Team')
        .getAll(r.args(tms), {index: 'id'})
        .filter((team) => r(orgIds).contains(team('orgId')))
        .filter((team) =>
          team('isArchived')
            .default(false)
            .ne(true)
        )
      primeStandardLoader(this.teams, teams)
      return orgIds.map((orgId) => {
        return teams.filter((team) => team.orgId === orgId)
      })
    }, this.dataloaderOptions)
    this.teamInvitationsByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink()
      const now = new Date()
      const teamInvitations = await r
        .table('TeamInvitation')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({acceptedAt: null})
        .filter((row) => row('expiresAt').ge(now))
      primeStandardLoader(this.teamInvitations, teamInvitations)
      return teamIds.map((teamId) => {
        return teamInvitations.filter((teamInvitation) => teamInvitation.teamId === teamId)
      })
    }, this.dataloaderOptions)
    this.teamMembersByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink()
      const teamMembers = await r
        .table('TeamMember')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isNotRemoved: true})
      primeStandardLoader(this.teamMembers, teamMembers)
      return teamIds.map((teamId) => {
        return teamMembers.filter((teamMember) => teamMember.teamId === teamId)
      })
    }, this.dataloaderOptions)
    this.agendaItemsByTeamId = makeCustomLoader(async (teamIds) => {
      const r = getRethink()
      const agendaItems = await r
        .table('AgendaItem')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter({isActive: true})
      primeStandardLoader(this.agendaItems, agendaItems)
      return teamIds.map((teamId) => {
        return agendaItems.filter((agendaItem) => agendaItem.teamId === teamId)
      })
    }, this.dataloaderOptions)
  }

  _share () {
    this.authToken = null
  }

  makeStandardLoader (table) {
    // don't pass in a a filter here because they requested a specific ID, they know what they want
    const batchFn = async (keys) => {
      const r = getRethink()
      const docs = await r.table(table).getAll(r.args(keys), {index: 'id'})
      return normalizeRethinkDbResults(keys, 'id')(docs, this.authToken, table)
    }
    return new DataLoader(batchFn)
  }

  agendaItems = this.makeStandardLoader('AgendaItem')
  customPhaseItems = this.makeStandardLoader('CustomPhaseItem')
  invitations = this.makeStandardLoader('Invitation')
  meetings = this.makeStandardLoader('Meeting')
  meetingSettings = this.makeStandardLoader('MeetingSettings')
  meetingMembers = this.makeStandardLoader('MeetingMember')
  newMeetings = this.makeStandardLoader('NewMeeting')
  newFeatures = this.makeStandardLoader('NewFeature')
  notifications = this.makeStandardLoader('Notification')
  orgApprovals = this.makeStandardLoader('OrgApproval')
  organizations = this.makeStandardLoader('Organization')
  organizationUsers = this.makeStandardLoader('OrganizationUser')
  reflectTemplates = this.makeStandardLoader('ReflectTemplate')
  retroReflectionGroups = this.makeStandardLoader('RetroReflectionGroup')
  retroReflections = this.makeStandardLoader('RetroReflection')
  softTeamMembers = this.makeStandardLoader('SoftTeamMember')
  suggestedActions = this.makeStandardLoader('SuggestedAction')
  tasks = this.makeStandardLoader('Task')
  teamMembers = this.makeStandardLoader('TeamMember')
  teamInvitations = this.makeStandardLoader('TeamInvitation')
  teams = this.makeStandardLoader('Team')
  users = this.makeStandardLoader('User')
}
