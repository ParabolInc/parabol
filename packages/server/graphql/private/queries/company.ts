import {GraphQLError} from 'graphql'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import type {QueryResolvers} from '../resolverTypes'

export type CompanySource = {
  id: string
}

const company: QueryResolvers['company'] = async (_source, {domain, userId}, {dataLoader}) => {
  if (domain) return {id: domain}
  if (!userId) {
    throw new GraphQLError('Provide a domain or a userId', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const user = await dataLoader.get('users').load(userId)
  if (!user) throw new GraphQLError('User not found', {extensions: {code: 'NOT_FOUND'}})
  const {email} = user
  const userDomain = getDomainFromEmail(email)

  if (!(await dataLoader.get('isCompanyDomain').load(userDomain))) return null
  return {id: userDomain}
}

export default company
