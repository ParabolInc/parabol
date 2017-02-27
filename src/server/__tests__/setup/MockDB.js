import getRethink from 'server/database/rethinkDriver';
import testUsers from 'server/__tests__/setup/testUsers';
import shortid from 'shortid';
import {BILLING_LEADER, LOBBY} from 'universal/utils/constants';
import {TRIAL_PERIOD} from 'server/utils/serverConstants'
import mockNow from 'server/__tests__/setup/mockNow';
import notificationTemplate from 'server/__tests__/utils/notificationTemplate';

const now = new Date(mockNow);

class MockDB {
  constructor() {
    this.db = {};
    this.context = {};
  }

  closeout(table, doc) {
    this.db[table] = this.db[table] || [];
    this.db[table].push(doc);
    this.context[table] = doc;
    return this;
  }

  // sugar so we don't have to call run all the time
  then(resolve, reject) {
    return this.run().then(resolve, reject);
  }

  newNotification(overrides = {}, template = {}) {
    return this.closeout('notification', {
      id: `${overrides.type}|${shortid.generate()}`,
      startAt: new Date(),
      orgId: this.context.organization.id,
      userIds: [this.context.user.id],
      ...notificationTemplate.call(this, template),
      ...overrides
    })
  }

  newOrg(overrides = {}) {
    return this.closeout('organization', {
      id: this.context.organization.id,
      createdAt: now,
      name: 'The Averagers, Inc.',
      orgUsers: [{
        id: this.context.user.id,
        role: BILLING_LEADER,
        inactive: false
      }],
      stripeId: `cus_${this.context.organization.id}`,
      stripeSubscriptionId: `sub_${this.context.organization.id}`,
      updatedAt: now,
      periodEnd: new Date(now.getTime() + TRIAL_PERIOD),
      periodStart: now,
      ...overrides
    })
  }

  newTeam(overrides = {}) {
    return this.closeout('team', {
      id: this.context.team.id,
      orgId: this.context.organization.id,
      teamName: 'Team America',
      activeFacilitator: null,
      facilitatorPhase: LOBBY,
      facilitatorPhaseItem: null,
      isPaid: true,
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
  };

  newUser(overrides = {}) {
    return this.closeout('user', {
      id: `test|${overrides.name.substr(0, 4)}_${this.context.organization.id}`,
      cachedAt: now,
      createdAt: now,
      emailVerified: false,
      lastLogin: now,
      lastSeenAt: now,
      inactive: false,
      identities: [],
      picture: 'https://placeimg.com/100/100/animals',
      tms: [this.context.team.id],
      updatedAt: now,
      userOrgs: [{
        id: this.context.organization.id,
        role: null,
      }],
      welcomeSentAt: now,
      ...overrides,
    });
  };

  org(contextIdx, updates) {
    this.context.organization = this.db.organization[contextIdx];
    if (updates) {
      Object.assign(this.context.organization, updates);
    }
    return this;
  }

  init(overrides = {}, templates = {}) {
    this.context.organization = {id: shortid.generate()};
    this.context.team = {id: shortid.generate()};
    const users = testUsers.map((user, idx) => ({
      ...user,
      trialOrg: idx === 0 ? this.context.organization.id : null,
      userOrgs: [{
        id: this.context.organization.id,
        role: idx === 0 ? BILLING_LEADER : null,
      }]
    }));
    users.forEach(this.newUser.bind(this));
    this.newTeam();
    users.forEach((user, idx) => {
      this.user(idx);
      this.newTeamMember({
        isLead: idx === 0,
        checkInOrder: idx
      })
    });
    const orgUsers = this.db.user.map((user) => ({
      id: user.id,
      inactive: false,
      role: user.userOrgs.find((org) => org.id === this.context.organization.id).role
    }));
    this.newOrg({orgUsers});
    return this;
  }

  async run() {
    const r = getRethink();
    const tables = Object.keys(this.db).map((name) => name[0].toUpperCase() + name.substr(1));
    const docsToInsert = Object.values(this.db);
    const promises = docsToInsert.map((docs, idx) => r.table(tables[idx]).insert(docs));
    await Promise.all(promises);
    return this.db;
  }

  user(contextIdx, updates) {
    this.context.user = this.db.user[contextIdx];
    if (updates) {
      Object.assign(this.context.user, updates);
    }
    return this;
  }
}

export default MockDB;
