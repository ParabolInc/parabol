import getRethink from '../../../database/rethinkDriver'
import getPg from '../../../postgres/getPg'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {toEpochSeconds} from '../../../utils/epochTime'
import isCompanyDomain from '../../../utils/isCompanyDomain'
import SlackServerManager from '../../../utils/SlackServerManager'
import {makeSection} from '../../mutations/helpers/notifications/makeSlackBlocks'
import {QueryResolvers} from '../resolverTypes'
import authCountByDomain from './helpers/authCountByDomain'

interface TypeField {
  type: 'mrkdwn'
  text: string
}

interface DomainCount {
  total: number
  domain: string
}

interface DomainCountWithAllTime extends DomainCount {
  allTimeTotal: number
}

// const MAX_CHARS_PER_FIELD = 2000
// const MAX_FIELDS = 10
// const MAX_BLOCKS = 50
const TOP_X = 20

const getTotal = (domainCount: DomainCount[]) =>
  domainCount.reduce((sum, row) => sum + row.total, 0)

const filterCounts = (domainCount: DomainCount[]) =>
  domainCount.filter(({domain, total}) => isCompanyDomain(domain) && total > 1).slice(0, TOP_X)

const addAllTimeTotals = async (domainCount: DomainCount[]): Promise<DomainCountWithAllTime[]> => {
  const pg = getPg()
  const allTimeCount = await pg.query(
    `SELECT count(*)::float as "allTimeTotal", "domain" from "User"
     WHERE "domain" = ANY($1::text[])
     GROUP BY "domain"`,
    [domainCount.map((count) => count.domain)]
  )

  const mergedCount = domainCount.map((count) => ({
    ...count,
    allTimeTotal: allTimeCount.rows.find((allTime) => allTime.domain === count.domain)?.allTimeTotal
  }))
  return mergedCount
}

const makeTopXSection = async (domainCount: DomainCount[]) => {
  const filtered = filterCounts(domainCount)
  const aggregated = await addAllTimeTotals(filtered)
  let curDomains = ''
  let curTotals = ''
  const fields = [] as TypeField[]
  aggregated.forEach((signup) => {
    const {domain, total, allTimeTotal} = signup
    curDomains += `*${domain}*\n`
    curTotals += `*${total}* (${allTimeTotal} total)\n`
  })
  if (aggregated.length === 0) {
    curDomains = 'No Data'
    curTotals = 'Sad Panda'
  }
  fields.push({type: 'mrkdwn', text: curDomains})
  fields.push({type: 'mrkdwn', text: curTotals})
  return {
    type: 'section',
    fields
  }
}

const dailyPulse: QueryResolvers['dailyPulse'] = async (_source, {after, email, channelId}) => {
  const r = await getRethink()
  const user = await getUserByEmail(email)
  if (!user) throw new Error('Bad user')
  const {id: userId} = user
  const slackAuth = await r
    .table('SlackAuth')
    .getAll(userId, {index: 'userId'})
    .filter((row) => row('botAccessToken').default(null).ne(null))
    .nth(0)
    .default(null)
    .run()
  if (!slackAuth) throw new Error('No Slack Auth Found!')
  const {botAccessToken} = slackAuth
  const [rawSignups, rawLogins] = await Promise.all([
    authCountByDomain(after, true, 'createdAt'),
    authCountByDomain(after, true, 'lastSeenAt')
  ])
  const totalSignups = getTotal(rawSignups)
  const signupsList = await makeTopXSection(rawSignups)

  const totalLogins = getTotal(rawLogins)
  const loginsList = await makeTopXSection(rawLogins)

  const start = toEpochSeconds(after)

  const blocks = [
    makeSection(
      `We've had *${totalSignups} Signups* and *${totalLogins} Logins* since <!date^${start}^{date_short} {time}|Yesterday>\n *Top Signups*`
    ),
    signupsList,
    makeSection(`*Top Logins*`),
    loginsList
  ]
  const manager = new SlackServerManager(botAccessToken!)
  const res = await manager.postMessage(channelId, blocks)
  return res.ok
}

export default dailyPulse
