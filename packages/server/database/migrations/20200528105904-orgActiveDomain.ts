import {R} from 'rethinkdb-ts'

const GENERIC_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'mail.com'
]

const isCompanyDomain = (domain) => !GENERIC_DOMAINS.includes(domain)

const getGroupMajority = (tlds) => {
  const countByDomain = {}
  tlds.forEach((tld) => {
    countByDomain[tld] = countByDomain[tld] || 0
    countByDomain[tld]++
  })
  let maxCount = 0
  let maxDomain = ''
  Object.keys(countByDomain).forEach((tld) => {
    const curCount = countByDomain[tld]
    if (curCount > maxCount) {
      maxCount = curCount
      maxDomain = tld
    }
  })
  return maxDomain
}

const getDomainFromEmail = (email) => {
  return email.slice(email.indexOf('@') + 1)
}

const getActiveDomainFromEmails = (emails) => {
  const tlds = emails.map(getDomainFromEmail)
  const companyDomains = tlds.filter(isCompanyDomain)
  return getGroupMajority(companyDomains)
}

export const up = async function (r: R) {
  try {
    await r.table('Organization').indexCreate('activeDomain').run()
  } catch (e) {
    console.log(e)
  }

  try {
    const groupings = (await r
      .table('OrganizationUser')
      .filter({removedAt: null})
      .merge((row) => ({
        email: r.table('User').get(row('userId'))('email').default('')
      }))
      .group('orgId')('email')
      .ungroup()
      .run()) as {group: string; reduction: string[]}[]

    const updates = [] as {orgId: string; activeDomain: string}[]

    groupings.forEach((group) => {
      const {group: orgId, reduction: emails} = group
      const activeDomain = getActiveDomainFromEmails(emails)
      if (activeDomain) {
        updates.push({orgId, activeDomain})
      }
    })
    await r(updates)
      .forEach((update) => {
        return r
          .table('Organization')
          .get(update('orgId'))
          .update({
            activeDomain: update('activeDomain')
          })
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r.table('Organization').indexDrop('activeDomain').run()
  } catch (e) {
    console.log(e)
  }

  try {
    await r
      .table('Organization')
      .replace((row) => row.without('activeDomain'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
