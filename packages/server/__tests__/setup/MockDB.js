// import {__anHourAgo} from './mockTimes'
// import testUsers from './testUsers'
// import notificationTemplate from '../utils/notificationTemplate'
// import getRethink from '../../database/rethinkDriver'
// import {ADD_USER} from '../../utils/serverConstants'
// import shortid from 'shortid'
// import {ACTIVE, CHECKIN, LOBBY, PERSONAL, PRO} from 'parabol-client/utils/constants'
// import getWeekOfYear from 'parabol-client/utils/getWeekOfYear'
// import {makeCheckinGreeting, makeCheckinQuestion} from 'parabol-client/utils/makeCheckinGreeting'
// import convertToRichText from './convertToRichText'
// import creditCardByToken from '../utils/creditCardByToken'
//
// const meetingTask = ({id, content, status, teamMemberId}) => ({
//   id,
//   content,
//   status,
//   teamMemberId
// })
//
// class MockDB {
//   constructor() {
//     this.db = {
//       agendaItem: [],
//       invoice: [],
//       invoiceItemHook: [],
//       meeting: [],
//       notification: [],
//       organization: [],
//       task: [],
//       taskHistory: [],
//       team: [],
//       teamMember: [],
//       user: []
//     }
//     this.context = {}
//
//     // create the methods to update entities
//     const selector = (name) => (contextIdx, updates) => {
//       this.context[name] = this.db[name][contextIdx]
//       if (updates) {
//         Object.assign(this.context[name], updates)
//       }
//       return this
//     }
//     Object.keys(this.db).forEach((table) => {
//       this[table] = selector(table)
//     })
//   }
//
//   closeout(table, doc) {
//     this.db[table] = this.db[table] || []
//     this.db[table].push(doc)
//     this.context[table] = doc
//     return this
//   }
//
//   init(template = {}) {
//     const orgId = shortid.generate()
//     // underscore for a static seed based on the first char
//     const teamId = `_${shortid.generate()}`
//     // this.context.team = {id: shortid.generate()};
//     const users = testUsers.map((user, idx) => ({
//       ...user,
//       userOrgs: [
//         {
//           id: orgId,
//           role: idx === 0 ? 'BILLING_LEADER' : null
//         }
//       ]
//     }))
//     this.newTeam({id: teamId, orgId})
//     users.forEach(this.newUser.bind(this))
//     users.forEach((user, idx) => {
//       this.user(idx)
//       this.newTeamMember({
//         isLead: idx === 0,
//         checkInOrder: idx
//       })
//     })
//     const orgUsers = this.db.user.map((user) => ({
//       id: user.id,
//       inactive: false,
//       role: user.userOrgs.find((org) => org.id === orgId).role
//     }))
//     if (template.plan === PRO) {
//       const creditCard = creditCardByToken.tok_4012888888881881
//       this.newOrg({
//         id: orgId,
//         orgUsers,
//         stripeId: true,
//         stripeSubscriptionId: true,
//         creditCard
//       })
//     } else {
//       this.newOrg({id: orgId, orgUsers})
//     }
//     return this
//   }
//
//   newAgendaItem(overrides = {}) {
//     const teamMemberId = this.context.teamMember.id
//     const [userId, teamId] = teamMemberId.split('::')
//     const table = this.db.agendaItem
//     return this.closeout('agendaItem', {
//       id: `${teamId}::${shortid.generate()}`,
//       content: convertToRichText(`Test Agenda Item[${table.length}]`),
//       isActive: true,
//       isComplete: false,
//       createdAt: new Date(__anHourAgo - 1 - table.length),
//       createdBy: userId,
//       sortOrder: table.filter((item) => item.teamId === teamId).length,
//       teamId,
//       teamMemberId,
//       updatedAt: new Date(__anHourAgo - table.length),
//       ...overrides
//     })
//   }
//
//   newInvoice(overrides = {}) {
//     const {id: orgId, name: orgName, picture} = this.context.organization
//     const addedUsersLineId = shortid.generate()
//     return this.closeout('invoice', {
//       id: shortid.generate(),
//       amountDue: 500,
//       createdAt: new Date(__anHourAgo),
//       total: 500,
//       billingLeaderEmails: this.db.user
//         .filter((user) =>
//           user.userOrgs.find((userOrg) => userOrg.id === orgId && userOrg.role === 'BILLING_LEADER')
//         )
//         .map((user) => user.email),
//       creditCard: this.context.organization.creditCard,
//       endAt: new Date(__anHourAgo),
//       invoiceDate: new Date(__anHourAgo),
//       lines: [
//         {
//           id: addedUsersLineId,
//           amount: 10,
//           details: [
//             {
//               id: shortid.generate(),
//               amount: 10,
//               email: this.db.user[7].email,
//               endAt: new Date(__anHourAgo),
//               startAt: new Date(__anHourAgo - 100),
//               parentId: addedUsersLineId
//             }
//           ],
//           quantity: 1,
//           type: 'ADDED_USERS'
//         }
//       ],
//       nextMonthCharges: 1000,
//       orgId,
//       orgName,
//       paidAt: new Date(__anHourAgo - 5),
//       picture,
//       startAt: new Date(__anHourAgo - 102),
//       startingBalance: 0,
//       status: 'PENDING',
//       ...overrides
//     })
//   }
//
//   newInvoiceItemHook(overrides = {}) {
//     return this.closeout('invoiceItemHook', {
//       id: shortid.generate(),
//       type: ADD_USER,
//       prorationDate: __anHourAgo / 1000,
//       stripeSubscriptionId: this.context.organization.stripeSubscriptionId,
//       userId: this.context.user.id,
//       ...overrides
//     })
//   }
//
//   newMeeting(overrides, template = {}) {
//     const {inProgress, activeFacilitatorIdx = 0} = template
//     const meetingId = shortid.generate()
//     const teamId = this.context.team.id
//     const baseMeeting = {
//       id: meetingId,
//       createdAt: inProgress ? new Date() : new Date(__anHourAgo),
//       meetingNumber:
//         this.db.meeting.filter((meeting) => meeting.teamId === this.context.team).length + 1,
//       teamId,
//       teamName: this.context.team.name,
//       ...overrides
//     }
//     // 3 agenda items, #1 has 1 private task, #2 has 1 task, #3 has 1 of each
//     const tasks = []
//     this.newAgendaItem({isComplete: true})
//     this.newTask({
//       agendaId: this.context.agendaItem.id,
//       sortOrder: undefined,
//       tags: ['private']
//     })
//     this.teamMember(1)
//     this.newAgendaItem({isComplete: true})
//     this.newTask({
//       agendaId: this.context.agendaItem.id,
//       sortOrder: undefined
//     })
//     tasks.push(meetingTask(this.context.task))
//     this.teamMember(2)
//     this.newAgendaItem({isComplete: true})
//     this.newTask({
//       agendaId: this.context.agendaItem.id,
//       sortOrder: undefined,
//       tags: ['private']
//     })
//     this.newTask({
//       agendaId: this.context.agendaItem.id,
//       sortOrder: undefined
//     })
//     tasks.push(meetingTask(this.context.task))
//     if (inProgress) {
//       const week = getWeekOfYear(new Date())
//       this.teamMember(activeFacilitatorIdx)
//       Object.assign(this.context.team, {
//         checkInGreeting: makeCheckinGreeting(week, teamId),
//         checkInQuestion: convertToRichText(makeCheckinQuestion(week, teamId)),
//         meetingId,
//         activeFacilitator: this.context.teamMember,
//         facilitatorPhase: CHECKIN,
//         facilitatorPhaseItem: 1,
//         meetingPhase: CHECKIN,
//         meetingPhaseItem: 1
//       })
//     } else {
//       Object.assign(baseMeeting, {
//         agendaItemsCompleted: 3,
//         endedAt: new Date(),
//         facilitator: this.context.team.activeFacilitator,
//         invitees: this.db.teamMember
//           .filter((tm) => tm.teamId === teamId)
//           .map((teamMember) => ({
//             id: teamMember.id,
//             picture: teamMember.picture,
//             preferredName: teamMember.preferredName,
//             present: true,
//             tasks: tasks.filter((a) => a.assigneeId === teamMember.id)
//           })),
//         tasks
//       })
//     }
//     return this.closeout('meeting', baseMeeting)
//   }
//
//   newNotification(overrides = {}, template = {}) {
//     return this.closeout('notification', {
//       id: `${template.type}|${shortid.generate()}`,
//       startAt: new Date(__anHourAgo + this.db.notification.length),
//       orgId: this.context.organization.id,
//       userIds: [this.context.user.id],
//       ...notificationTemplate.call(this, template),
//       ...overrides
//     })
//   }
//
//   newOrg(overrides = {}) {
//     const anHourAgo = new Date(__anHourAgo)
//     const {id = shortid.generate()} = this.context.organizaton || {}
//     const newOverrides = {...overrides}
//     if (newOverrides.stripeId === true) {
//       newOverrides.stripeId = `cus_${id}`
//     }
//     if (newOverrides.stripeSubscriptionId === true) {
//       newOverrides.stripeSubscriptionId = `sub_${id}`
//     }
//     this.db.user.forEach((user, idx) => {
//       this.db.user[idx].userOrgs = this.db.user[idx].userOrgs || []
//       this.db.user[idx].userOrgs.push({
//         id,
//         role: this.context.user.id === user.id ? 'BILLING_LEADER' : null
//       })
//     })
//     return this.closeout('organization', {
//       id,
//       createdAt: anHourAgo,
//       creditCard: {},
//       name: 'The Averagers, Inc.',
//       orgUsers: this.context.user
//         ? [
//             {
//               id: this.context.user.id,
//               role: 'BILLING_LEADER',
//               inactive: false
//             }
//           ]
//         : [],
//       updatedAt: anHourAgo,
//       periodStart: anHourAgo,
//       ...newOverrides
//     })
//   }
//
//   newTask(overrides = {}) {
//     const teamMemberId = this.context.teamMember.id
//     const [userId] = teamMemberId.split('::')
//     const teamId = this.context.team.id
//     const table = this.db.task
//     return this.closeout('task', {
//       id: `${teamId}::${shortid.generate()}`,
//       content: convertToRichText(`Test Task[${table.length}]`),
//       createdAt: new Date(__anHourAgo - 1 - table.length),
//       createdBy: userId,
//       sortOrder: table.filter((item) => item.teamId === teamId).length,
//       status: ACTIVE,
//       tags: [],
//       teamId,
//       assigneeId: teamMemberId,
//       updatedAt: new Date(__anHourAgo - table.length),
//       userId,
//       ...overrides
//     })
//   }
//
//   newTaskHistory(overrides = {}) {
//     const {
//       task: {id, content, assigneeId, status, updatedAt}
//     } = this.context
//     return this.closeout('taskHistory', {
//       id: `${id}::${shortid.generate()}`,
//       taskId: id,
//       content,
//       assigneeId,
//       status,
//       updatedAt,
//       ...overrides
//     })
//   }
//
//   newTeam(overrides = {}) {
//     const id = shortid.generate()
//     const orgId = shortid.generate()
//     return this.closeout('team', {
//       id,
//       orgId,
//       name: 'Team America',
//       activeFacilitator: null,
//       facilitatorPhase: LOBBY,
//       facilitatorPhaseItem: null,
//       isArchived: false,
//       isPaid: true,
//       meetingId: null,
//       meetingPhase: LOBBY,
//       meetingPhaseItem: null,
//       tier: PERSONAL,
//       ...overrides
//     })
//   }
//
//   newTeamMember(overrides = {}) {
//     return this.closeout('teamMember', {
//       id: `${this.context.user.id}::${this.context.team.id}`,
//       isLead: false,
//       isNotRemoved: true,
//       isFacilitator: false,
//       teamId: this.context.team.id,
//       userId: this.context.user.id,
//       email: this.context.user.email,
//       picture: this.context.user.picture,
//       preferredName: this.context.user.preferredName,
//       ...overrides
//     })
//   }
//
//   newUser(overrides = {}) {
//     const anHourAgo = new Date(__anHourAgo)
//     const {id: orgId = shortid.generate()} = this.context.organization || {}
//     const {id: teamId = shortid.generate()} = this.context.team || {}
//     return this.closeout('user', {
//       id: `test|${overrides.name.substr(0, 4)}_${orgId}`,
//       cachedAt: anHourAgo,
//       createdAt: anHourAgo,
//       email: overrides.name ? `${overrides.name}@example.com` : null,
//       emailVerified: false,
//       lastLogin: anHourAgo,
//       lastSeenAt: anHourAgo,
//       inactive: false,
//       identities: [],
//       picture: 'https://placeimg.com/100/100/animals',
//       preferredName: overrides.name,
//       tms: [teamId],
//       updatedAt: anHourAgo,
//       userOrgs: [
//         {
//           id: orgId,
//           role: null
//         }
//       ],
//       welcomeSentAt: anHourAgo,
//       ...overrides
//     })
//   }
//
//   async run() {
//     const r = await getRethink()
//     const tables = Object.keys(this.db).map((name) => name[0].toUpperCase() + name.substr(1))
//     const docsToInsert = Object.values(this.db)
//     const promises = docsToInsert.reduce((obj, docs, idx) => {
//       if (docs.length) {
//         const table = tables[idx]
//         obj[table] = r.table(table).insert(docs)
//       }
//       return obj
//     }, {})
//     await r.expr(promises)
//     return this.db
//   }
//
//   // sugar so we don't have to call run all the time
//   then(resolve, reject) {
//     return this.run().then(resolve, reject)
//   }
// }
//
// export default MockDB
