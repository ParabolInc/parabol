import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import isCompanyDomain from '../../../utils/isCompanyDomain'
import {QueryResolvers} from '../resolverTypes'

export type CompanySource = {
  id: string
}

const company: QueryResolvers['company'] = async (_source, {domain, userId}, {dataLoader}) => {
  if (domain) return {id: domain}
  const user = userId && (await dataLoader.get('users').load(userId))
  if (!user) throw new Error('User not found')
  const {email} = user
  const userDomain = getDomainFromEmail(email)
  if (!isCompanyDomain(userDomain)) return null
  return {id: userDomain}
}

export default company
