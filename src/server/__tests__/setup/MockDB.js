import {__anHourAgo} from 'server/__tests__/setup/mockTimes';
import testUsers from 'server/__tests__/setup/testUsers';
import newInvitee from 'server/__tests__/utils/newInvitee';
import notificationTemplate from 'server/__tests__/utils/notificationTemplate';
import getRethink from 'server/database/rethinkDriver';
import {PENDING, INVITATION_LIFESPAN, ADD_USER} from 'server/utils/serverConstants';
import shortid from 'shortid';
import {ACTIVE, ADDED_USERS, BILLING_LEADER, CHECKIN, LOBBY, PERSONAL, PRO} from 'universal/utils/constants';
import getWeekOfYear from 'universal/utils/getWeekOfYear';
import {makeCheckinGreeting, makeCheckinQuestion} from 'universal/utils/makeCheckinGreeting';
import {makeSuccessExpression, makeSuccessStatement} from 'universal/utils/makeSuccessCopy';
import convertToRichText from './convertToRichText';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';

const meetingProject = ({id, content, status, teamMemberId}) => ({
  id,
  content,
  status,
  teamMemberId
});

class MockDB {
  constructor() {
    this.db = {
      agendaItem: [],
      invitation: [],
      invoice: [],
      invoiceItemHook: [],
      meeting: [],
      notification: [],
      organization: [],
      orgApproval: [],
      project: [],
      projectHistory: [],
      team: [],
      teamMember: [],
      user: []
    };
    this.context = {};

    // create the methods to update entities
    const selector = (name) => (contextIdx, updates) => {
      this.context[name] = this.db[name][contextIdx];
      if (updates) {
        Object.assign(this.context[name], updates);
      }
      return this;
    };
    Object.keys(this.db).forEach((table) => {
      this[table] = selector(table);
    });
  }

  closeout(table, doc) {
    this.db[table] = this.db[table] || [];
    this.db[table].push(doc);
    this.context[table] = doc;
    return this;
  }

  init(template = {}) {
    const orgId = shortid.generate();
    // underscore for a static seed based on the first char
    const teamId = `_${shortid.generate()}`;
    // this.context.team = {id: shortid.generate()};
    const users = testUsers.map((user, idx) => ({
      ...user,
      userOrgs: [{
        id: orgId,
        role: idx === 0 ? BILLING_LEADER : null
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
    if (template.plan === PRO) {
      const creditCard = creditCardByToken.tok_4012888888881881;
      this.newOrg({id: orgId, orgUsers, stripeId: true, stripeSubscriptionId: true, creditCard});
    } else {
      this.newOrg({id: orgId, orgUsers});
    }
    return this;
  }

  newAgendaItem(overrides = {}) {
    const teamMemberId = this.context.teamMember.id;
    const [userId, teamId] = teamMemberId.split('::');
    const table = this.db.agendaItem;
    return this.closeout('agendaItem', {
      id: `${teamId}::${shortid.generate()}`,
      content: convertToRichText(`Test Agenda Item[${table.length}]`),
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

  newInvitation(overrides = {}) {
    const invitee = newInvitee();
    return this.closeout('invitation', {
      id: shortid.generate(),
      // acceptedAt: null,
      createdAt: new Date(__anHourAgo),
      email: invitee.email,
      // fullName: overrides.email || invitee.email,
      hashedToken: shortid.generate(),
      invitedBy: this.context.teamMember.id,
      inviteCount: 1,
      teamId: this.context.team.id,
      tokenExpiration: new Date(__anHourAgo + INVITATION_LIFESPAN),
      updatedAt: new Date(__anHourAgo),
      ...overrides
    });
  }

  newInvoice(overrides = {}) {
    const {id: orgId, name: orgName, picture} = this.context.organization;
    const addedUsersLineId = shortid.generate();
    return this.closeout('invoice', {
      id: shortid.generate(),
      amountDue: 500,
      createdAt: new Date(__anHourAgo),
      total: 500,
      billingLeaderEmails:
        this.db.user
          .filter((user) => user.userOrgs.find((userOrg) => userOrg.id === orgId && userOrg.role === BILLING_LEADER))
          .map((user) => user.email),
      creditCard: this.context.organization.creditCard,
      endAt: new Date(__anHourAgo),
      invoiceDate: new Date(__anHourAgo),
      lines: [{
        id: addedUsersLineId,
        amount: 10,
        details: [{
          id: shortid.generate(),
          amount: 10,
          email: this.db.user[7].email,
          endAt: new Date(__anHourAgo),
          startAt: new Date(__anHourAgo - 100),
          parentId: addedUsersLineId
        }],
        quantity: 1,
        type: ADDED_USERS
      }],
      nextMonthCharges: 1000,
      orgId,
      orgName,
      paidAt: new Date(__anHourAgo - 5),
      picture,
      startAt: new Date(__anHourAgo - 102),
      startingBalance: 0,
      status: PENDING,
      ...overrides
    });
  }

  newInvoiceItemHook(overrides = {}) {
    return this.closeout('invoiceItemHook', {
      id: shortid.generate(),
      type: ADD_USER,
      prorationDate: __anHourAgo / 1000,
      stripeSubscriptionId: this.context.organization.stripeSubscriptionId,
      userId: this.context.user.id,
      ...overrides
    });
  }

  newMeeting(overrides, template = {}) {
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
    // 3 agenda items, #1 has 1 private project, #2 has 1 project, #3 has 1 of each
    const projects = [];
    this.newAgendaItem({isComplete: true});
    this.newProject({agendaId: this.context.agendaItem.id, sortOrder: undefined, tags: ['private']});
    this.teamMember(1);
    this.newAgendaItem({isComplete: true});
    this.newProject({agendaId: this.context.agendaItem.id, sortOrder: undefined});
    projects.push(meetingProject(this.context.project));
    this.teamMember(2);
    this.newAgendaItem({isComplete: true});
    this.newProject({agendaId: this.context.agendaItem.id, sortOrder: undefined, tags: ['private']});
    this.newProject({agendaId: this.context.agendaItem.id, sortOrder: undefined});
    projects.push(meetingProject(this.context.project));
    if (inProgress) {
      const week = getWeekOfYear(new Date());
      this.teamMember(activeFacilitatorIdx);
      Object.assign(this.context.team, {
        checkInGreeting: makeCheckinGreeting(week, teamId),
        checkInQuestion: makeCheckinQuestion(week, teamId),
        meetingId,
        activeFacilitator: this.context.teamMember,
        facilitatorPhase: CHECKIN,
        facilitatorPhaseItem: 1,
        meetingPhase: CHECKIN,
        meetingPhaseItem: 1
      });
    } else {
      Object.assign(baseMeeting, {
        agendaItemsCompleted: 3,
        endedAt: new Date(),
        facilitator: this.context.team.activeFacilitator,
        successExpression: makeSuccessExpression(),
        successStatement: makeSuccessStatement(),
        invitees: this.db.teamMember.filter((tm) => tm.teamId === teamId).map((teamMember) => ({
          id: teamMember.id,
          picture: teamMember.picture,
          preferredName: teamMember.preferredName,
          present: true,
          projects: projects.filter((a) => a.teamMemberId === teamMember.id)
        })),
        projects
      });
    }
    return this.closeout('meeting', baseMeeting);
  }

  newNotification(overrides = {}, template = {}) {
    return this.closeout('notification', {
      id: `${template.type}|${shortid.generate()}`,
      startAt: new Date(__anHourAgo + this.db.notification.length),
      orgId: this.context.organization.id,
      userIds: [this.context.user.id],
      ...notificationTemplate.call(this, template),
      ...overrides
    });
  }

  newOrg(overrides = {}) {
    const anHourAgo = new Date(__anHourAgo);
    const {id = shortid.generate()} = this.context.organizaton || {};
    const newOverrides = {...overrides};
    if (newOverrides.stripeId === true) {
      newOverrides.stripeId = `cus_${id}`;
    }
    if (newOverrides.stripeSubscriptionId === true) {
      newOverrides.stripeSubscriptionId = `sub_${id}`;
    }
    this.db.user.forEach((user, idx) => {
      this.db.user[idx].userOrgs = this.db.user[idx].userOrgs || [];
      this.db.user[idx].userOrgs.push({
        id,
        role: this.context.user.id === user.id ? BILLING_LEADER : null
      });
    });
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
      updatedAt: anHourAgo,
      periodStart: anHourAgo,
      ...newOverrides
    });
  }

  newOrgApproval(overrides = {}) {
    const anHourAgo = new Date(__anHourAgo);
    return this.closeout('orgApproval', {
      id: shortid.generate(),
      createdAt: new Date(anHourAgo.getTime() + this.db.orgApproval.length),
      email: newInvitee().email,
      isActive: true,
      orgId: this.context.organization.id,
      status: PENDING,
      teamId: this.context.team.id,
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
      content: convertToRichText(`Test Project[${table.length}]`),
      createdAt: new Date(__anHourAgo - 1 - table.length),
      createdBy: userId,
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
    const id = shortid.generate();
    const orgId = shortid.generate();
    return this.closeout('team', {
      id,
      orgId,
      name: 'Team America',
      activeFacilitator: null,
      facilitatorPhase: LOBBY,
      facilitatorPhaseItem: null,
      isArchived: false,
      isPaid: true,
      meetingId: null,
      meetingPhase: LOBBY,
      meetingPhaseItem: null,
      tier: PERSONAL,
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
      preferredName: overrides.name,
      tms: [teamId],
      updatedAt: anHourAgo,
      userOrgs: [{
        id: orgId,
        role: null
      }],
      welcomeSentAt: anHourAgo,
      ...overrides
    });
  }

  async run() {
    const r = getRethink();
    const tables = Object.keys(this.db).map((name) => name[0].toUpperCase() + name.substr(1));
    const docsToInsert = Object.values(this.db);
    const promises = docsToInsert.reduce((obj, docs, idx) => {
      if (docs.length) {
        const table = tables[idx];
        obj[table] = r.table(table).insert(docs);
      }
      return obj;
    }, {});
    await r.expr(promises);
    return this.db;
  }

  // sugar so we don't have to call run all the time
  then(resolve, reject) {
    return this.run().then(resolve, reject);
  }
}

export default MockDB;
