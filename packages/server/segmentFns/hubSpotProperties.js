// import fetch from 'node-fetch'
// const key = 'x'

// const isUserRemoved = {
//   name: 'is_user_removed',
//   groupName: 'parabol_app_info',
//   description: 'true if the user has been removed from the app',
//   fieldType: 'booleancheckbox',
//   type: 'string',
//   formField: false,
//   displayOrder: -1,
//   label: 'Is User Removed?'
// }

// const lastMetAt = {
//   name: 'last_met_at',
//   groupName: 'parabol_app_info',
//   description: 'The last time the user checked into a meeting',
//   fieldType: 'number',
//   type: 'datetime',
//   formField: false,
//   displayOrder: -1,
//   label: 'Last Met At'
// }

// const monthlyStreakCurrent = {
//   name: 'monthly_streak_current',
//   groupName: 'parabol_app_info',
//   description: 'The number of consecutive 30-day intervals that the user has checked into a meeting, as of their last meeting run',
//   fieldType: 'number',
//   type: 'number',
//   formField: false,
//   displayOrder: -1,
//   label: 'Monthly Streak Current'
// }

// const monthlyStreakMax = {
//   name: 'monthly_streak_max',
//   groupName: 'parabol_app_info',
//   description: 'The all-time maximum number of consecutive 30-day intervals that the user has checked into a meeting',
//   fieldType: 'number',
//   type: 'number',
//   formField: false,
//   displayOrder: -1,
//   label: 'Monthly Streak Max'
// }

// const joinedAt = {
//   name: 'joined_at',
//   groupName: 'parabol_app_info',
//   description: 'The datetime the user signed up for Parabol',
//   fieldType: 'number',
//   type: 'datetime',
//   formField: false,
//   displayOrder: -1,
//   label: 'Joined At'
// }

// const isPatientZero = {
//   name: 'is_patient_zero',
//   groupName: 'parabol_app_info',
//   description: 'true if the user is the first to join Parabol from the domain in their email, else false',
//   fieldType: 'booleancheckbox',
//   type: 'string',
//   formField: false,
//   displayOrder: -1,
//   label: 'Is Patient Zero?'
// }

// const userCount = {
//   name: 'user_count',
//   groupName: 'parabol_app_information',
//   description: 'The total number of users across all associated organizations',
//   fieldType: 'number',
//   type: 'number',
//   label: 'User Count'
// }

// const activeUserCount = {
//   name: 'active_user_count',
//   groupName: 'parabol_app_information',
//   description: 'The number of active users across all associated organizations',
//   fieldType: 'number',
//   type: 'number',
//   label: 'Active User Count'
// }

// const activeTeamCount = {
//   name: 'active_team_count',
//   groupName: 'parabol_app_information',
//   description: 'The number of active teams across all associated organizations',
//   fieldType: 'number',
//   type: 'number',
//   label: 'Active Team Count'
// }

// const meetingCount = {
//   name: 'meeting_count',
//   groupName: 'parabol_app_information',
//   description: 'The total number of meetings started across all teams on all organizations',
//   fieldType: 'number',
//   type: 'number',
//   label: 'Meeting Count'
// }

// const monthlyTeamStreakMax = {
//   name: 'monthly_team_streak_max',
//   groupName: 'parabol_app_information',
//   description: 'The longest monthly streak for meeting at least once per calendar month for any team in the company',
//   fieldType: 'number',
//   type: 'number',
//   label: 'Monthly Team Streak Max'
// }

// const companyLastMetAt = {
//   name: 'last_met_at',
//   groupName: 'parabol_app_information',
//   description: 'The last time a team from the company started a meeting',
//   fieldType: 'number',
//   type: 'datetime',
//   label: 'Last Met At'
// }

// const companyHighestTier = {
//   name: 'highest_tier',
//   groupName: 'parabol_app_information',
//   description: 'The highest tier an organization in the company achived',
//   fieldType: 'text',
//   type: 'string',
//   label: 'Highest Tier'
// }

// const getContactProperty = async (propName: string) => {
//   const url = `https://api.hubapi.com/properties/v1/contacts/properties/named/${propName}?hapikey=${key}`
//   const res = await fetch(url)
//   const resJSON = await res.json()
//   console.log({resJSON})
// }

// const updateContactProperty = async (propObj: typeof lastMetAt) => {
//   const {name} = propObj
//   const url = `https://api.hubapi.com/properties/v1/contacts/properties/named/${name}?hapikey=${key}`
//   const res = await fetch(url, {
//     method: 'PUT',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(propObj)
//   })
//   const resJSON = await res.json()
//   console.log({resJSON})
// }

// const createContactProperty = async (propObj: typeof lastMetAt) => {
//   const {name} = propObj
//   const url = `https://api.hubapi.com/properties/v1/contacts/properties?hapikey=${key}`
//   const res = await fetch(url, {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(propObj)
//   })
//   const resJSON = await res.json()
//   console.log({resJSON})
// }

// const getCompanyGroups = async () => {
//   const url = `https://api.hubapi.com/properties/v1/companies/groups?hapikey=${key}`
//   const res = await fetch(url)
//   const resJSON = await res.json()
//   console.log({resJSON})
// }

// const createCompanyProperty = async (propObj: typeof userCount) => {
//   const url = `https://api.hubapi.com/properties/v1/companies/properties?hapikey=${key}`
//   const res = await fetch(url, {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(propObj)
//   })
//   const resJSON = await res.json()
//   console.log({resJSON})
// }

// createCompanyProperty(companyHighestTier)
