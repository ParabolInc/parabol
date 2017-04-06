import getRethink from 'server/database/rethinkDriver';
import testUsers from 'server/__tests__/setup/testUsers';
import shortid from 'shortid';
import {
  BILLING_LEADER,
  LOBBY,
  ACTIVE,
  CHECKIN
} from 'universal/utils/constants';
import {TRIAL_PERIOD} from 'server/utils/serverConstants';
import notificationTemplate from 'server/__tests__/utils/notificationTemplate';
import {__anHourAgo} from 'server/__tests__/setup/mockTimes';
import {makeCheckinGreeting, makeCheckinQuestion} from 'universal/utils/makeCheckinGreeting';
import getWeekOfYear from 'universal/utils/getWeekOfYear';
import {makeSuccessExpression, makeSuccessStatement} from 'universal/utils/makeSuccessCopy';

const meetingAction = ({id, content, teamMemberId}) => ({
  id,
  content,
  teamMemberId,
});

const meetingProject = ({id, content, status, teamMemberId}) => ({
  id,
  content,
  status,
  teamMemberId,
});

class MockDB {
  constructor() {
    this.db = {
      action: [],
      agendaItem: [],
      meeting: [],
      notification: [],
      organization: [],
      project: [],
      projectHistory: [],
      team: [],
      teamMember: [],
      user: []
    };
    this.context = {};
  }

  _selector = (name) => (contextIdx, updates) => {
    this.context[name] = this.db[name][contextIdx];
    if (updates) {
      Object.assign(this.context[name], updates);
    }
    return this;
  };

  closeout(table, doc) {
    this.db[table] = this.db[table] || [];
    this.db[table].push(doc);
    this.context[table] = doc;
    return this;
  }

  init() {
    const orgId = shortid.generate();
    const teamId = shortid.generate();
    // this.context.team = {id: shortid.generate()};
    const users = testUsers.map((user, idx) => ({
      ...user,
      trialOrg: idx === 0 ? orgId : null,
      userOrgs: [{
        id: orgId,
        role: idx === 0 ? BILLING_LEADER : null,
      }]
    }));
    this.newTeam({id: teamId, orgId});
    users.forEach(this.newUser.bind(this));
    users.forEach((user, idx) => {
      this.user(idx);
      this.newTeamMember({
        isLead: idx === 0,
        checkInOrder: idx
      });
    });
    const orgUsers = this.db.user.map((user) => ({
      id: user.id,
      inactive: false,
      role: user.userOrgs.find((org) => org.id === orgId).role
    }));
    this.newOrg({id: orgId, orgUsers});
    return this;
  }

  newAction(overrides = {}) {
    const teamMemberId = this.context.teamMember.id;
    const [userId] = teamMemberId.split('::');
    const table = this.db.action;
    return this.closeout('action', {
      id: `${this.context.team.id}::${shortid.generate()}`,
      content: `Test Action[${table.length}]`,
      createdAt: new Date(__anHourAgo - 1 - table.length),
      createdBy: userId,
      isComplete: false,
      sortOrder: table.filter((item) => item.userId === userId).length,
      teamMemberId,
      updatedAt: new Date(__anHourAgo - table.length),
      userId,
      ...overrides
    });
  }

  newAgendaItem(overrides = {}) {
    const teamMemberId = this.context.teamMember.id;
    const [userId, teamId] = teamMemberId.split('::');
    const table = this.db.agendaItem;
    return this.closeout('agendaItem', {
      id: `${teamId}::${shortid.generate()}`,
      content: `Test Agenda Item[${table.length}]`,
      isActive: true,
      isComplete: false,
      createdAt: new Date(__anHourAgo - 1 - table.length),
      createdBy: userId,
      sortOrder: table.filter((item) => item.teamId === teamId).length,
      teamId,
      teamMemberId,
      updatedAt: new Date(__anHourAgo - table.length),
      ...overrides
    });
  }

  newMeeting(overrides = {}, template = {}) {
    const {inProgress, activeFacilitatorIdx = 0} = template;
    const meetingId = shortid.generate();
    const teamId = this.context.team.id;
    const baseMeeting = {
      id: meetingId,
      createdAt: inProgress ? new Date() : new Date(__anHourAgo),
      meetingNumber: this.db.meeting.filter((meeting) => meeting.teamId === this.context.team).length + 1,
      teamId,
      teamName: this.context.team.name
    };
    // 3 agenda items, #1 has 1 action, #2 has 1 project, #3 has 1 of each
    const actions = [];
    const projects = [];
    this.newAgendaItem({isComplete: true});
    this.newAction({agendaId: this.context.agendaItem.id, sortOrder: undefined});
    actions.push(meetingAction(this.context.action));
    this.teamMember(1);
    this.newAgendaItem({isComplete: true});
    this.newProject({agendaId: this.context.agendaItem.id, sortOrder: undefined});
    projects.push(meetingProject(this.context.project));
    this.teamMember(2);
    this.newAgendaItem({isComplete: true});
    this.newAction({agendaId: this.context.agendaItem.id, sortOrder: undefined});
    this.newProject({agendaId: this.context.agendaItem.id, sortOrder: undefined});
    actions.push(meetingAction(this.context.action));
    projects.push(meetingProject(this.context.project));
    if (inProgress) {
      const week = getWeekOfYear(new Date());
      this.teamMember(activeFacilitatorIdx);
      Object.assign(this.context.team, {
        checkInGreeting: makeCheckinGreeting(week),
        checkInQuestion: makeCheckinQuestion(week),
        meetingId,
        activeFacilitator: this.context.teamMember,
        facilitatorPhase: CHECKIN,
        facilitatorPhaseItem: 1,
        meetingPhase: CHECKIN,
        meetingPhaseItem: 1,
      });
    } else {
      Object.assign(baseMeeting, {
        actions,
        agendaItemsCompleted: 3,
        endedAt: new Date(),
        facilitator: this.context.team.activeFacilitator,
        successExpression: makeSuccessExpression(),
        successStatement: makeSuccessStatement(),
        invitees: this.db.teamMember.filter((tm) => tm.teamId === teamId).map((teamMember) => ({
          id: teamMember.id,
          actions: actions.filter((a) => a.teamMemberId === teamMember.id),
          picture: teamMember.picture,
          preferredName: teamMember.preferredName,
          present: true,
          projects: projects.filter((a) => a.teamMemberId === teamMember.id),
        })),
        projects
      });
    }
    return this.closeout('meeting', baseMeeting);
  }

  newNotification(overrides = {}, template = {}) {
    return this.closeout('notification', {
      id: `${overrides.type}|${shortid.generate()}`,
      startAt: new Date(__anHourAgo),
      orgId: this.context.organization.id,
      userIds: [this.context.user.id],
      ...notificationTemplate.call(this, template),
      ...overrides
    });
  }

  newOrg(overrides = {}) {
    const anHourAgo = new Date(__anHourAgo);
    const {id = shortid.generate()} = this.context.organizaton || {};
    return this.closeout('organization', {
      id,
      createdAt: anHourAgo,
      creditCard: {},
      name: 'The Averagers, Inc.',
      orgUsers: this.context.user ? [{
        id: this.context.user.id,
        role: BILLING_LEADER,
        inactive: false
      }] : [],
      stripeId: `cus_${id}`,
      stripeSubscriptionId: `sub_${id}`,
      updatedAt: anHourAgo,
      periodEnd: new Date(anHourAgo.getTime() + TRIAL_PERIOD),
      periodStart: anHourAgo,
      ...overrides
    });
  }

  newProject(overrides = {}) {
    const teamMemberId = this.context.teamMember.id;
    const [userId] = teamMemberId.split('::');
    const teamId = this.context.team.id;
    const table = this.db.project;
    return this.closeout('project', {
      id: `${teamId}::${shortid.generate()}`,
      content: `Test Project[${table.length}]`,
      createdAt: new Date(__anHourAgo - 1 - table.length),
      createdBy: userId,
      isArchived: false,
      sortOrder: table.filter((item) => item.teamId === teamId).length,
      status: ACTIVE,
      teamId,
      teamMemberId,
      updatedAt: new Date(__anHourAgo - table.length),
      userId,
      ...overrides
    });
  }

  newProjectHistory(overrides = {}) {
    const {project: {id, content, teamMemberId, status, updatedAt}} = this.context;
    return this.closeout('projectHistory', {
      id: `${id}::${shortid.generate()}`,
      projectId: id,
      content,
      teamMemberId,
      status,
      updatedAt,
      ...overrides
    });
  }

  newTeam(overrides = {}) {
    const {id = shortid.generate()} = this.context.team || {};
    const {id: orgId = shortid.generate()} = this.context.organization || {};
    return this.closeout('team', {
      id,
      orgId,
      name: 'Team America',
      activeFacilitator: null,
      facilitatorPhase: LOBBY,
      facilitatorPhaseItem: null,
      isPaid: true,
      isArchived: false,
      meetingId: null,
      meetingPhase: LOBBY,
      meetingPhaseItem: null,
      ...overrides
    });
  }

  newTeamMember(overrides = {}) {
    return this.closeout('teamMember', {
      id: `${this.context.user.id}::${this.context.team.id}`,
      isNotRemoved: true,
      isFacilitator: false,
      teamId: this.context.team.id,
      userId: this.context.user.id,
      email: this.context.user.email,
      picture: this.context.user.picture,
      preferredName: this.context.user.preferredName,
      ...overrides
    });
  }

  newUser(overrides = {}) {
    const anHourAgo = new Date(__anHourAgo);
    const {id: orgId = shortid.generate()} = this.context.organization || {};
    const {id: teamId = shortid.generate()} = this.context.team || {};
    return this.closeout('user', {
      id: `test|${overrides.name.substr(0, 4)}_${orgId}`,
      cachedAt: anHourAgo,
      createdAt: anHourAgo,
      emailVerified: false,
      lastLogin: anHourAgo,
      lastSeenAt: anHourAgo,
      inactive: false,
      identities: [],
      picture: 'https://placeimg.com/100/100/animals',
      tms: [teamId],
      updatedAt: anHourAgo,
      userOrgs: [{
        id: orgId,
        role: null,
      }],
      welcomeSentAt: anHourAgo,
      ...overrides,
    });
  }

  notification = this._selector('notification');
  org = this._selector('organization');

  async run() {
    const r = getRethink();
    const tables = Object.keys(this.db).map((name) => name[0].toUpperCase() + name.substr(1));
    const docsToInsert = Object.values(this.db);
    const promises = docsToInsert.map((docs, idx) => docs.length && r.table(tables[idx]).insert(docs));
    await Promise.all(promises);
    return this.db;
  }

  team = this._selector('team');
  teamMember = this._selector('teamMember');

  // sugar so we don't have to call run all the time
  then(resolve, reject) {
    return this.run().then(resolve, reject);
  }

  user = this._selector('user');
}

export default MockDB;
